package eduflow.admin.course.controllers

import eduflow.admin.course.dto.survey.SurveyAttemptCreateRequest
import eduflow.admin.course.models.lesson.survey.CourseLessonSurveyAnswerModel
import eduflow.admin.course.models.lesson.survey.CourseLessonSurveyAttemptModel
import eduflow.admin.course.models.lesson.survey.CourseLessonSurveyModel
import eduflow.admin.course.repositories.lessons.survey.CourseLessonSurveyAttemptRepository
import eduflow.admin.course.repositories.lessons.survey.CourseLessonSurveyRepository
import eduflow.admin.services.AuthenticationService
import eduflow.course.lesson.survey.CourseLessonSurveyAnswer
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono
import java.util.*

@RestController
@RequestMapping("/api/courses-hub")
class CourseSurveyController(
    private val surveyRepository: CourseLessonSurveyRepository,
    private val attemptRepository: CourseLessonSurveyAttemptRepository,
    private val authenticationService: AuthenticationService
) {

    @GetMapping("/surveys.get/{id}")
    fun getSurveyByLessonId(
        @PathVariable id: String
    ): Mono<ResponseEntity<CourseLessonSurveyModel>> {
        return surveyRepository.findByLessonId(id)
            .map { ResponseEntity.ok(it) }
            .defaultIfEmpty(ResponseEntity.notFound().build())
    }

    @PostMapping("/surveys.attempt")
    fun createSurveyAttempt(
        @RequestBody request: SurveyAttemptCreateRequest
    ): Mono<ResponseEntity<CourseLessonSurveyAttemptModel>> {
        val user = authenticationService.getCurrentUser()
        val userId = user._id

        return surveyRepository.findById(request.surveyId)
            .flatMap { survey ->
                val answers = calculateAnswers(survey, request.userChoices)
                val score = calculateScore(answers)

                val attempt = CourseLessonSurveyAttemptModel(
                    _id = UUID.randomUUID().toString(),
                    surveyId = request.surveyId,
                    userId = userId,
                    completedAt = Date(),
                    score = score,
                    answers = answers
                )

                attemptRepository.save(attempt)
                    .map { ResponseEntity.ok(it) }
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

}
