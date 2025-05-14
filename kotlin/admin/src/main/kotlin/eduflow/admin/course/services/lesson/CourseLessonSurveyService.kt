package eduflow.admin.course.services.lesson

import eduflow.admin.course.dto.lesson.create.LessonAddSurveyRequest
import eduflow.admin.course.dto.lesson.create.LessonCreateResponse
import eduflow.admin.course.models.lesson.survey.CourseLessonSurveyChoiceModel
import eduflow.admin.course.models.lesson.survey.CourseLessonSurveyModel
import eduflow.admin.course.models.lesson.survey.CourseLessonSurveyQuestionModel
import eduflow.admin.course.repositories.lessons.survey.CourseLessonSurveyRepository
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import java.util.*

@Service
class CourseLessonSurveyService(
    private val surveyRepository: CourseLessonSurveyRepository,
    private val lessonService: CourseLessonService
) {
    fun addSurvey(survey: LessonAddSurveyRequest): Mono<LessonCreateResponse> {
        return surveyRepository.findByLessonId(survey._id)
            .flatMap { existingSurvey ->
                val updatedSurvey = existingSurvey.copy(
                    questions = survey.questions.map { question ->
                        CourseLessonSurveyQuestionModel(
                            _id = question._id ?: UUID.randomUUID().toString(),
                            title = question.title,
                            choices = question.choices.map { choice ->
                                CourseLessonSurveyChoiceModel(
                                    _id = choice._id ?: UUID.randomUUID().toString(),
                                    title = choice.title,
                                    isCorrect = choice.isCorrect
                                )
                            }
                        )
                    }
                )
                surveyRepository.save(updatedSurvey)
            }
            .switchIfEmpty(
                Mono.defer {
                    val newSurvey = CourseLessonSurveyModel(
                        _id = UUID.randomUUID().toString(),
                        lessonId = survey._id,
                        questions = survey.questions.map { question ->
                            CourseLessonSurveyQuestionModel(
                                _id = UUID.randomUUID().toString(),
                                title = question.title,
                                choices = question.choices.map { choice ->
                                    CourseLessonSurveyChoiceModel(
                                        _id = UUID.randomUUID().toString(),
                                        title = choice.title,
                                        isCorrect = choice.isCorrect
                                    )
                                }
                            )
                        }
                    )
                    surveyRepository.save(newSurvey)
                }
            )
            .flatMap { savedSurvey ->
                lessonService.clearSurveyText(savedSurvey.lessonId)
                    .thenReturn(LessonCreateResponse(lessonId = savedSurvey.lessonId))
            }
    }

    fun getSurveyByLessonId(lessonId: String): Mono<CourseLessonSurveyModel> {
        return surveyRepository.findByLessonId(lessonId)
    }
}