package flowledge.admin.course.controllers

import flowledge.admin.course.dto.survey.SurveyAttemptCreateRequest
import flowledge.admin.course.dto.survey.SurveyGetByIdResponse
import flowledge.admin.course.dto.survey.SurveyResultGetResponse
import flowledge.admin.course.services.lesson.survey.CourseLessonSurveyAttemptService
import flowledge.admin.course.services.lesson.survey.CourseLessonSurveyService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api")
class CourseSurveyController(
    private val surveyService: CourseLessonSurveyService,
    private val attemptService: CourseLessonSurveyAttemptService
) {
    @GetMapping("/surveys.get/{id}")
    fun getSurveyByLessonId(
        @PathVariable id: String,
        @RequestParam courseId: String
    ): Mono<ResponseEntity<SurveyGetByIdResponse>> {
        return surveyService.getByLessonId(id, courseId)
    }

    @PostMapping("/surveys.attempt")
    fun createSurveyAttempt(
        @RequestBody request: SurveyAttemptCreateRequest
    ): Mono<ResponseEntity<SurveyResultGetResponse>> {
        return attemptService.createAttempt(request)
    }

}
