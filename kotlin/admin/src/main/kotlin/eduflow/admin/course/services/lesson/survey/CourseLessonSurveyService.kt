package flowledge.admin.course.services.lesson.survey

import flowledge.admin.course.dto.lesson.create.LessonAddSurveyRequest
import flowledge.admin.course.dto.survey.SurveyGetByIdResponse
import flowledge.admin.course.models.lesson.survey.CourseLessonSurveyModel
import flowledge.admin.course.models.lesson.survey.CourseLessonSurveyQuestionModel
import flowledge.admin.course.repositories.lessons.survey.CourseLessonSurveyAttemptRepository
import flowledge.admin.course.repositories.lessons.survey.CourseLessonSurveyRepository
import flowledge.admin.course.services.course.CourseVersionService
import flowledge.admin.course.services.lesson.CourseVersionLessonService
import flowledge.admin.services.AuthenticationService
import flowledge.admin.utils.generateId
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class CourseLessonSurveyService(
    private val surveyRepository: CourseLessonSurveyRepository,
    private val versionService: CourseVersionService,
    private val lessonVersionService: CourseVersionLessonService,
    private val attemptRepository: CourseLessonSurveyAttemptRepository,
    private val authenticationService: AuthenticationService,
    private val attemptService: CourseLessonSurveyAttemptService
) {
    fun getByLessonId(id: String, courseId: String): Mono<ResponseEntity<SurveyGetByIdResponse>> {
        val user = authenticationService.getCurrentUser()
        val userId = user._id

        return versionService.getTargetVersion(courseId)
            .flatMap { latestVersion ->
                val surveyId = latestVersion.sections
                    ?.flatMap { section -> section.lessons ?: emptyList() }
                    ?.firstOrNull { lesson -> lesson._id == id }
                    ?.surveyId


                if (surveyId != null) {
                    surveyRepository.findById(surveyId)
                        .flatMap { survey ->
                            attemptRepository.findBySurveyIdAndUserId(survey._id, userId)
                                .collectList()
                                .flatMap<ResponseEntity<SurveyGetByIdResponse>> { attempts ->
                                    val result = if (attempts.isNotEmpty()) {
                                        val currentAttempt = attempts.last()
                                        attemptService.calculateSurveyResultOnAttempt(
                                            survey, attempts, currentAttempt
                                        )
                                    } else {
                                        null
                                    }

                                    Mono.just(ResponseEntity.ok(SurveyGetByIdResponse(survey, result)))
                                }
                        }
                        .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()))
                } else {
                    Mono.just(ResponseEntity.notFound().build())
                }
            }
            .onErrorResume {
                Mono.just(ResponseEntity.badRequest().build())
            }
    }

    fun add(request: LessonAddSurveyRequest): Mono<String> {
        return versionService.getTargetVersion(request.courseId)
            .flatMap { version ->
                val result = lessonVersionService.getLessonInVersion(version, request._id)
                if (result != null) {
                    val (lessonInVersion, _) = result
                    if (lessonInVersion.surveyId != null) {
                        surveyRepository.findById(lessonInVersion.surveyId)
                            .flatMap { existingSurvey ->
                                val updatedSurvey = existingSurvey.copy(
                                    maxAttempts = request.maxAttempts ?: existingSurvey.maxAttempts,
                                    passThreshold = request.passThreshold ?: existingSurvey.passThreshold,
                                    questions = request.questions.map { question ->
                                        CourseLessonSurveyQuestionModel.create(
                                            _id = question._id ?: generateId(),
                                            title = question.title,
                                            choices = question.choices
                                        )
                                    }
                                )
                                surveyRepository.save(updatedSurvey)
                            }
                    } else {
                        val newSurvey = CourseLessonSurveyModel.create(
                            maxAttempts = request.maxAttempts,
                            passThreshold = request.passThreshold,
                            questions = request.questions
                        )
                        surveyRepository.save(newSurvey)
                    }
                } else {
                    Mono.error(NoSuchElementException("Лекция не найдена в текущей версии курса"))
                }
            }
            .flatMap { savedSurvey ->
                versionService.getTargetVersion(request.courseId)
                    .flatMap { version ->
                        val updatedSections =
                            lessonVersionService.updateSectionsWithLesson(version, request._id) { lessonModel ->
                                lessonModel.copy(surveyId = savedSurvey._id)
                            }

                        lessonVersionService.updateVersionWithSections(
                            request.courseId,
                            version,
                            updatedSections
                        ).thenReturn(savedSurvey._id)
                    }
            }
    }

    fun get(_id: String): Mono<CourseLessonSurveyModel> {
        return surveyRepository.findById(_id)
    }

}