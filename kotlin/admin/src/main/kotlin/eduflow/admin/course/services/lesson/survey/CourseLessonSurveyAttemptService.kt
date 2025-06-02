package flowledge.admin.course.services.lesson.survey

import flowledge.admin.course.dto.survey.SurveyAttemptCreateRequest
import flowledge.admin.course.dto.survey.SurveyResultGetResponse
import flowledge.admin.course.models.lesson.survey.CourseLessonSurveyAnswerModel
import flowledge.admin.course.models.lesson.survey.CourseLessonSurveyAttemptModel
import flowledge.admin.course.models.lesson.survey.CourseLessonSurveyModel
import flowledge.admin.course.repositories.lessons.survey.CourseLessonSurveyAttemptRepository
import flowledge.admin.course.repositories.lessons.survey.CourseLessonSurveyRepository
import flowledge.admin.services.AuthenticationService
import flowledge.admin.utils.generateId
import flowledge.course.lesson.survey.CourseLessonSurveyAnswer
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import java.util.*

@Service
class CourseLessonSurveyAttemptService(
    private val surveyRepository: CourseLessonSurveyRepository,
    private val attemptRepository: CourseLessonSurveyAttemptRepository,
    private val authenticationService: AuthenticationService,
) {

    fun createAttempt(request: SurveyAttemptCreateRequest): Mono<ResponseEntity<SurveyResultGetResponse>> {
        val user = authenticationService.getCurrentUser()
        val userId = user._id

        return surveyRepository.findById(request.surveyId)
            .flatMap { survey ->
                val answers = calculateAnswers(survey, request.userChoices)
                val score = calculateScore(answers)

                val attempt = CourseLessonSurveyAttemptModel(
                    _id = generateId(),
                    surveyId = request.surveyId,
                    userId = userId,
                    completedAt = Date(),
                    score = score,
                    answers = answers
                )

                attemptRepository.save(attempt)
                    .flatMap { savedAttempt ->
                        attemptRepository.findBySurveyIdAndUserId(request.surveyId, userId)
                            .collectList()
                            .flatMap { attempts ->
                                val response = calculateSurveyResultOnAttempt(
                                    survey, attempts, savedAttempt
                                )
                                Mono.just(ResponseEntity.ok(response))
                            }
                    }
            }
            .defaultIfEmpty(ResponseEntity.notFound().build())
            .onErrorResume {
                Mono.just(ResponseEntity.badRequest().build())
            }
    }

    private fun calculateAnswers(
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

    private fun calculateScore(answers: List<CourseLessonSurveyAnswer>): Int {
        return answers.count { it.userChoiceId == it.correctChoiceId } * 100 / answers.size
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