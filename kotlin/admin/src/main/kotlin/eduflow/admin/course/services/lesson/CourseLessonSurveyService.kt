package eduflow.admin.course.services.lesson

import eduflow.admin.course.dto.lesson.create.LessonAddSurveyRequest
import eduflow.admin.course.dto.lesson.create.LessonCreateResponse
import eduflow.admin.course.dto.survey.SurveyResultGetResponse
import eduflow.admin.course.models.lesson.survey.*
import eduflow.admin.course.repositories.lessons.CourseLessonRepository
import eduflow.admin.course.repositories.lessons.survey.CourseLessonSurveyRepository
import eduflow.admin.utils.generateId
import eduflow.course.lesson.survey.CourseLessonSurveyAnswer
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class CourseLessonSurveyService(
    private val surveyRepository: CourseLessonSurveyRepository,
    private val lessonService: CourseLessonService,
    private val lessonRepository: CourseLessonRepository
) {
    fun addSurvey(request: LessonAddSurveyRequest): Mono<LessonCreateResponse> {
        return lessonRepository.findById(request._id)
            .flatMap { lesson ->
                if (lesson.surveyId != null) {
                    surveyRepository.findById(lesson.surveyId)
                        .flatMap { existingSurvey ->
                            val updatedSurvey = existingSurvey.copy(
                                maxAttempts = request.maxAttempts ?: existingSurvey.maxAttempts,
                                passThreshold = request.passThreshold ?: existingSurvey.passThreshold,
                                questions = request.questions.map { question ->
                                    CourseLessonSurveyQuestionModel(
                                        _id = question._id ?: generateId(),
                                        title = question.title,
                                        choices = question.choices.map { choice ->
                                            CourseLessonSurveyChoiceModel(
                                                _id = choice._id ?: generateId(),
                                                title = choice.title,
                                                isCorrect = choice.isCorrect
                                            )
                                        }
                                    )
                                }
                            )
                            surveyRepository.save(updatedSurvey)
                        }
                } else {
                    // Если у урока нет surveyId, создаем новый опрос
                    val newSurvey = CourseLessonSurveyModel(
                        _id = generateId(),
                        maxAttempts = request.maxAttempts ?: 1,
                        passThreshold = request.passThreshold ?: 50,
                        questions = request.questions.map { question ->
                            CourseLessonSurveyQuestionModel(
                                _id = generateId(),
                                title = question.title,
                                choices = question.choices.map { choice ->
                                    CourseLessonSurveyChoiceModel(
                                        _id = generateId(),
                                        title = choice.title,
                                        isCorrect = choice.isCorrect
                                    )
                                }
                            )
                        }
                    )
                    surveyRepository.save(newSurvey)
                }
            }
            .flatMap { savedSurvey ->
                lessonService.clearSurveyText(request._id, savedSurvey._id)
                    .thenReturn(LessonCreateResponse(lessonId = request._id))
            }
    }

    fun getSurvey(lessonId: String): Mono<CourseLessonSurveyModel> {
        return surveyRepository.findById(lessonId)
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

}