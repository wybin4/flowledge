package flowledge.admin.course.controllers

import flowledge.admin.course.dto.lesson.LessonUpdateRequest
import flowledge.admin.course.dto.lesson.create.*
import flowledge.admin.course.dto.lesson.get.LessonGetHubResponse
import flowledge.admin.course.dto.lesson.get.LessonGetListResponse
import flowledge.admin.course.models.lesson.CourseLessonModel
import flowledge.admin.course.services.lesson.CourseLessonService
import flowledge.admin.course.services.lesson.survey.CourseLessonSurveyService
import flowledge.admin.services.AuthenticationService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api")
class CourseLessonController(
    private val lessonService: CourseLessonService,
    private val surveyService: CourseLessonSurveyService,
    private val authenticationService: AuthenticationService,
) {

    @PostMapping("/courses-hub/lessons.create")
    fun createLesson(
        @RequestBody lesson: LessonCreateRequest
    ): Mono<*> {
        return when (lesson) {
            is LessonCreateDraftRequest -> {
                try {
                    val user = authenticationService.getCurrentUser()
                    lessonService.createDraft(lesson, user.getLocale())
                } catch (e: IllegalArgumentException) {
                    Mono.error<Any>(ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid request body for draft"))
                }
            }

            is LessonAddVideoRequest -> {
                try {
                    lessonService.addVideo(lesson)
                } catch (e: IllegalArgumentException) {
                    Mono.error<Any>(ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid request body for video"))
                }
            }

            is LessonRemoveVideoRequest -> {
                try {
                    lessonService.removeVideo(lesson)
                } catch (e: IllegalArgumentException) {
                    Mono.error<Any>(
                        ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Invalid request body for video removing"
                        )
                    )
                }
            }

            is LessonAddDetailsRequest -> {
                try {
                    lessonService.addDetails(lesson)
                } catch (e: IllegalArgumentException) {
                    Mono.error<Any>(ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid request body for details"))
                }
            }

            is LessonAddSynopsisAndStuffRequest -> {
                try {
                    lessonService.addSynopsisAndStuff(lesson)
                } catch (e: IllegalArgumentException) {
                    Mono.error<Any>(ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid request body for details"))
                }
            }

            is LessonAddSurveyRequest -> {
                try {
                    surveyService.add(lesson).flatMap {
                        lessonService.clearSurveyText(lesson, it)
                    }
                } catch (e: IllegalArgumentException) {
                    Mono.error<Any>(ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid request body for details"))
                }
            }

            else -> Mono.error<Any>(IllegalArgumentException("Invalid action parameter"))
        }
    }

    @PostMapping("/courses-hub/lessons.update/{id}")
    fun updateLessonDetails(
        @PathVariable id: String,
        @RequestBody request: LessonUpdateRequest
    ): Mono<ResponseEntity<CourseLessonModel>> {
        return lessonService.update(id, request)
    }

    @DeleteMapping("/courses-hub/lessons.delete/{id}")
    fun deleteLesson(
        @PathVariable id: String,
        @RequestParam courseId: String
    ): Mono<ResponseEntity<Void>> {
        return lessonService.deleteById(id, courseId)
    }

    @GetMapping("/courses-hub/lessons.get/{id}")
    fun getLessonForHub(
        @PathVariable id: String,
        @RequestParam courseId: String
    ): Mono<ResponseEntity<LessonGetHubResponse>> {
        return lessonService.getForHubById(id, courseId)
    }

    @GetMapping("/courses-list/lessons.get/{id}")
    fun getLessonForList(
        @PathVariable id: String,
        @RequestParam courseId: String
    ): Mono<ResponseEntity<LessonGetListResponse>> {
        return lessonService.getForListById(id, courseId)
    }

}
