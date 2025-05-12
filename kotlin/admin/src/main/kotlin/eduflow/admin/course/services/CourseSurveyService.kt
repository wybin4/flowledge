package eduflow.admin.course.services

import eduflow.admin.course.dto.lesson.create.LessonAddSurveyRequest
import eduflow.admin.course.dto.lesson.create.LessonCreateResponse
import eduflow.admin.course.models.survey.CourseSurveyChoiceModel
import eduflow.admin.course.models.survey.CourseSurveyModel
import eduflow.admin.course.models.survey.CourseSurveyQuestionModel
import eduflow.admin.course.repositories.CourseSurveyRepository
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import java.util.*

@Service
class CourseSurveyService(
    private val surveyRepository: CourseSurveyRepository,
    private val lessonService: CourseLessonService
) {
    fun addSurvey(survey: LessonAddSurveyRequest): Mono<LessonCreateResponse> {
        return surveyRepository.findByLessonId(survey._id)
            .flatMap { existingSurvey ->
                val updatedSurvey = existingSurvey.copy(
                    questions = survey.questions.map { question ->
                        CourseSurveyQuestionModel(
                            _id = question._id ?: UUID.randomUUID().toString(),
                            title = question.title,
                            choices = question.choices.map { choice ->
                                CourseSurveyChoiceModel(
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
                    val newSurvey = CourseSurveyModel(
                        _id = UUID.randomUUID().toString(),
                        lessonId = survey._id,
                        questions = survey.questions.map { question ->
                            CourseSurveyQuestionModel(
                                _id = UUID.randomUUID().toString(),
                                title = question.title,
                                choices = question.choices.map { choice ->
                                    CourseSurveyChoiceModel(
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

    fun getSurveyByLessonId(lessonId: String): Mono<CourseSurveyModel> {
        return surveyRepository.findByLessonId(lessonId)
    }
}