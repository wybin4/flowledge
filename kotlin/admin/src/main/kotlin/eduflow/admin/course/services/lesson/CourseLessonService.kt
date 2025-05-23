package eduflow.admin.course.services.lesson

import eduflow.admin.course.dto.lesson.create.*
import eduflow.admin.course.models.lesson.CourseLessonModel
import eduflow.admin.course.repositories.course.CourseRepository
import eduflow.admin.course.repositories.lessons.CourseLessonRepository
import eduflow.admin.course.services.course.CourseVersionService
import eduflow.user.Language
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import reactor.core.publisher.Mono

@Service
class CourseLessonService(
    private val lessonRepository: CourseLessonRepository,
    private val courseRepository: CourseRepository,
    private val courseVersionService: CourseVersionService,
) {
    fun createDraft(request: LessonCreateDraftRequest, locale: Language): Mono<LessonCreateResponse> {
        return courseRepository.findById(request.courseId)
            .flatMap { course ->
                val latestVersion = course.getLatestVersion()
                if (latestVersion != null) {
                    val sectionToUpdate = latestVersion.sections?.find { it._id == request.sectionId }
                    if (sectionToUpdate != null) {
                        lessonRepository.countBySectionIdAndIsDraft(request.sectionId, true)
                            .flatMap { draftCount ->
                                val title = when (locale) {
                                    Language.RU -> "черновик лекции ${draftCount + 1}"
                                    Language.EN -> "draft lecture ${draftCount + 1}"
                                    else -> "draft lecture ${draftCount + 1}"
                                }

                                val newLesson = CourseLessonModel.create(
                                    title = title,
                                    sectionId = request.sectionId
                                )

                                lessonRepository.save(newLesson)
                                    .flatMap { savedLesson ->
                                        courseVersionService.addLessonToSection(
                                            courseId = request.courseId,
                                            sectionId = request.sectionId
                                        ) { section ->
                                            val updatedLessons = section.lessons?.toMutableList() ?: mutableListOf()
                                            updatedLessons.add(savedLesson._id)
                                            section.copy(lessons = updatedLessons)
                                        }
                                            .then(Mono.just(LessonCreateResponse(savedLesson._id)))
                                    }
                            }
                    } else {
                        Mono.error(NoSuchElementException("Секция не найдена"))
                    }
                } else {
                    Mono.error(IllegalStateException("Нет версий для обновления"))
                }
            }
    }

    fun addVideo(lesson: LessonAddVideoRequest): Mono<LessonCreateResponse> {
        if (lesson.videoId == null && (lesson.synopsis != null || lesson.survey != null)) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "synopsis and surveyText require videoId")
        }
        if (lesson.survey != null && lesson.synopsis == null) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "surveyText requires synopsis")
        }

        return lessonRepository.findById(lesson._id)
            .flatMap { existingLesson ->
                existingLesson.videoId = lesson.videoId
                existingLesson.surveyText = lesson.survey
                existingLesson.synopsisText = lesson.synopsis
                lessonRepository.save(existingLesson)
            }
            .map { savedLesson -> LessonCreateResponse(savedLesson._id) }
    }

    fun removeVideo(lesson: LessonRemoveVideoRequest): Mono<LessonCreateResponse> {
        return lessonRepository.findById(lesson._id)
            .flatMap { existingLesson ->
                existingLesson.videoId = null
                existingLesson.surveyText = null
                existingLesson.synopsisText = null
                lessonRepository.save(existingLesson)
            }
            .map { savedLesson -> LessonCreateResponse(savedLesson._id) }
    }

    fun addDetails(lesson: LessonAddDetailsRequest): Mono<LessonCreateResponse> {
        return lessonRepository.findById(lesson._id)
            .flatMap { existingLesson ->
                if (lesson.autoDetect) {
                    if (lesson.time != null || lesson.timeUnit != null) {
                        return@flatMap Mono.error<CourseLessonModel>(
                            ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Time and timeUnit should be null when autoDetect is true"
                            )
                        )
                    }
                    // TODO: здесь будет логика для autoDetect
                } else {
                    if (lesson.time == null || lesson.timeUnit == null) {
                        return@flatMap Mono.error<CourseLessonModel>(
                            ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Time and timeUnit should not be null when autoDetect is false"
                            )
                        )
                    }
                    existingLesson.time = "${lesson.time} ${lesson.timeUnit}"
                }

                existingLesson.isDraft = false
                existingLesson.title = lesson.title
                if (lesson.imageUrl != null) {
                    existingLesson.imageUrl = lesson.imageUrl
                }
                lessonRepository.save(existingLesson)
            }
            .map { savedLesson -> LessonCreateResponse(savedLesson._id) }
    }

    fun addSynopsisAndStuff(lesson: LessonAddSynopsisAndStuffRequest): Mono<LessonCreateResponse> {
        return lessonRepository.findById(lesson._id)
            .flatMap { existingLesson ->
                existingLesson.synopsisText = lesson.synopsisText
                // TODO: work with stuff
                lessonRepository.save(existingLesson)
            }
            .map { savedLesson -> LessonCreateResponse(savedLesson._id) }
    }

    fun clearSurveyText(lessonId: String, surveyId: String): Mono<Void> {
        return lessonRepository.findById(lessonId)
            .flatMap { lesson ->
                val updatedLesson = lesson.copy(surveyText = null, surveyId = surveyId)
                lessonRepository.save(updatedLesson)
            }
            .then()
    }

    fun getVisibleLessonsByIds(ids: List<String>): Mono<List<CourseLessonModel>> {
        return lessonRepository.findByIdInAndIsVisible(ids, true)
            .collectList()
    }

}