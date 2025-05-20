package eduflow.admin.course.services.lesson

import eduflow.admin.course.dto.lesson.create.LessonAddSurveyRequest
import eduflow.admin.course.dto.lesson.create.LessonCreateResponse
import eduflow.admin.course.dto.survey.SurveyResultGetResponse
import eduflow.admin.course.models.lesson.survey.*
import eduflow.admin.course.repositories.lessons.survey.CourseLessonSurveyRepository
import eduflow.course.lesson.survey.CourseLessonSurveyAnswer
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
                    maxAttempts = survey.maxAttempts ?: existingSurvey.maxAttempts,
                    passThreshold = survey.passThreshold ?: existingSurvey.passThreshold,
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
                        maxAttempts = survey.maxAttempts ?: 1,
                        passThreshold = survey.passThreshold ?: 50,
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

    fun calculateAnswers(
        survey: CourseLessonSurveyModel,
        userChoices: List<String>
    ): List<CourseLessonSurveyAnswerModel> {
        return survey.questions.mapIndexed { index, question ->
            val userChoiceId = userChoices[index]
            val correctChoiceId = question.choices.find { it.isCorrect == true }?._id ?: ""

            CourseLessonSurveyAnswerModel(
                userChoiceId = userChoiceId,
                correctChoiceId = correctChoiceId,
            )
        }
    }

    fun calculateScore(answers: List<CourseLessonSurveyAnswer>): Int {
        return answers.count { it.userChoiceId == it.correctChoiceId } * 100 / answers.size
    }

    fun calculateSurveyResult(
        survey: CourseLessonSurveyModel,
        attempts: List<CourseLessonSurveyAttemptModel>,
    ): SurveyResultGetResponse {
        val passThreshold = survey.passThreshold
        val maxAttempts = survey.maxAttempts
        val userAttempts = attempts.size

        val bestResult = attempts.maxOfOrNull { it.score } ?: 0

        return SurveyResultGetResponse(
            passThreshold = passThreshold,
            bestResult = bestResult,
            maxAttempts = maxAttempts,
            userAttempts = userAttempts
        )
    }

    fun calculateSurveyResultOnAttempt(
        survey: CourseLessonSurveyModel,
        attempts: List<CourseLessonSurveyAttemptModel>,
        currentAttempt: CourseLessonSurveyAttemptModel
    ): SurveyResultGetResponse {
        val passThreshold = survey.passThreshold
        val maxAttempts = survey.maxAttempts
        val userAttempts = attempts.size

        val bestResult = attempts.maxOfOrNull { it.score } ?: 0

        val currentResult = currentAttempt.score

        return SurveyResultGetResponse(
            passThreshold = passThreshold,
            bestResult = bestResult,
            currentResult = currentResult,
            maxAttempts = maxAttempts,
            userAttempts = userAttempts
        )
    }

    fun getSurveysForLessons(lessonIds: List<String>): Mono<List<CourseLessonSurveyModel>> {
        return surveyRepository.findByLessonIdIn(lessonIds).collectList()
    }
}