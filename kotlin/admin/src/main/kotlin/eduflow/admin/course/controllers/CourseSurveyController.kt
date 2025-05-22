package eduflow.admin.course.controllers

import eduflow.admin.course.dto.survey.SurveyAttemptCreateRequest
import eduflow.admin.course.dto.survey.SurveyGetByIdResponse
import eduflow.admin.course.dto.survey.SurveyResultGetResponse
import eduflow.admin.course.models.lesson.survey.CourseLessonSurveyAttemptModel
import eduflow.admin.course.repositories.lessons.survey.CourseLessonSurveyAttemptRepository
import eduflow.admin.course.repositories.lessons.survey.CourseLessonSurveyRepository
import eduflow.admin.course.services.lesson.CourseLessonSurveyService
import eduflow.admin.services.AuthenticationService
import eduflow.admin.utils.generateId
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono
import java.util.*

@RestController
@RequestMapping("/api")
class CourseSurveyController(
    private val surveyRepository: CourseLessonSurveyRepository,
    private val surveyService: CourseLessonSurveyService,
    private val attemptRepository: CourseLessonSurveyAttemptRepository,
    private val authenticationService: AuthenticationService
) {

    @GetMapping("/surveys.get/{id}")
    fun getSurveyByLessonId(
        @PathVariable id: String
    ): Mono<ResponseEntity<SurveyGetByIdResponse>> {
        val user = authenticationService.getCurrentUser()
        val userId = user._id

        return surveyRepository.findByLessonId(id)
            .flatMap { survey ->
                attemptRepository.findBySurveyIdAndUserId(survey._id, userId)
                    .collectList()
                    .flatMap { attempts ->
                        val result = if (attempts.isNotEmpty()) {
                            val currentAttempt = attempts.last()
                            surveyService.calculateSurveyResultOnAttempt(
                                survey, attempts, currentAttempt
                            )
                        } else {
                            null
                        }

                        Mono.just(ResponseEntity.ok(SurveyGetByIdResponse(survey, result)))
                    }
            }
            .defaultIfEmpty(ResponseEntity.notFound().build())
            .onErrorResume {
                Mono.just(ResponseEntity.badRequest().build())
            }
    }

    @PostMapping("/surveys.attempt")
    fun createSurveyAttempt(
        @RequestBody request: SurveyAttemptCreateRequest
    ): Mono<ResponseEntity<SurveyResultGetResponse>> {
        val user = authenticationService.getCurrentUser()
        val userId = user._id

        return surveyRepository.findById(request.surveyId)
            .flatMap { survey ->
                val answers = surveyService.calculateAnswers(survey, request.userChoices)
                val score = surveyService.calculateScore(answers)

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
                                val response = surveyService.calculateSurveyResultOnAttempt(
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

}
