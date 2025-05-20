package eduflow.admin.course.controllers

import eduflow.admin.course.dto.lesson.LessonUpdateRequest
import eduflow.admin.course.dto.lesson.create.*
import eduflow.admin.course.dto.lesson.get.LessonGetHubResponse
import eduflow.admin.course.dto.lesson.get.LessonGetListResponse
import eduflow.admin.course.models.lesson.CourseLessonModel
import eduflow.admin.course.repositories.lessons.CourseLessonRepository
import eduflow.admin.course.services.CourseSectionService
import eduflow.admin.course.services.lesson.CourseLessonService
import eduflow.admin.course.services.lesson.CourseLessonSurveyService
import eduflow.admin.services.AuthenticationService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import reactor.core.publisher.Mono
import reactor.kotlin.core.publisher.switchIfEmpty

@RestController
@RequestMapping("/api")
class CourseLessonController(
    private val lessonRepository: CourseLessonRepository,
    private val lessonService: CourseLessonService,
    private val sectionService: CourseSectionService,
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
                    surveyService.addSurvey(lesson)
                } catch (e: IllegalArgumentException) {
                    Mono.error<Any>(ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid request body for details"))
                }
            }

            else -> Mono.error<Any>(IllegalArgumentException("Invalid action parameter"))
        }
    }

    @PostMapping("/courses-hub/lessons.update/{id}")
    fun updateLessonTitle(
        @PathVariable id: String,
        @RequestBody request: LessonUpdateRequest
    ): Mono<ResponseEntity<CourseLessonModel>> {
        return lessonRepository.findById(id)
            .flatMap { existingLesson ->
                val updatedLesson = existingLesson.copy(
                    title = request.title ?: existingLesson.title,
                    time = request.time ?: existingLesson.time,
                    imageUrl = request.imageUrl ?: existingLesson.imageUrl,
                    videoId = request.videoId ?: existingLesson.videoId,
                    isVisible = request.isVisible ?: existingLesson.isVisible
                )
                lessonRepository.save(updatedLesson)
                    .map { ResponseEntity.ok(it) }
            }
            .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()))
    }

    @DeleteMapping("/courses-hub/lessons.delete/{id}")
    fun deleteLesson(
        @PathVariable id: String
    ): Mono<ResponseEntity<Void>> {
        return lessonRepository.findById(id)
            .flatMap { lesson ->
                sectionService.removeLessonFromSection(lesson.sectionId, id)
                    .then(lessonRepository.deleteById(id))
            }
            .then(Mono.just<ResponseEntity<Void>>(ResponseEntity.noContent().build()))
            .onErrorResume { _: Throwable ->
                Mono.just(ResponseEntity.notFound().build())
            }
    }


    @GetMapping("/courses-hub/lessons.get/{id}")
    fun getLessonForHub(
        @PathVariable id: String
    ): Mono<ResponseEntity<LessonGetHubResponse>> {
        return lessonRepository.findById(id)
            .flatMap { lesson ->
                surveyService.getSurveyByLessonId(lesson._id)
                    .map { survey ->
                        LessonGetHubResponse(
                            _id = lesson._id,
                            createdAt = lesson.createdAt,
                            imageUrl = lesson.imageUrl,
                            isDraft = lesson.isDraft,
                            isVisible = lesson.isVisible,
                            sectionId = lesson.sectionId,
                            surveyText = lesson.surveyText,
                            synopsisText = lesson.synopsisText,
                            survey = survey,
                            time = lesson.time,
                            title = lesson.title,
                            updatedAt = lesson.updatedAt,
                            videoId = lesson.videoId
                        )
                    }
                    .defaultIfEmpty(
                        LessonGetHubResponse(
                            _id = lesson._id,
                            createdAt = lesson.createdAt,
                            imageUrl = lesson.imageUrl,
                            isDraft = lesson.isDraft,
                            isVisible = lesson.isVisible,
                            sectionId = lesson.sectionId,
                            surveyText = lesson.surveyText,
                            synopsisText = lesson.synopsisText,
                            survey = null,
                            time = lesson.time,
                            title = lesson.title,
                            updatedAt = lesson.updatedAt,
                            videoId = lesson.videoId
                        )
                    )
            }
            .map { ResponseEntity.ok(it) }
            .defaultIfEmpty(ResponseEntity.notFound().build())
    }

    @GetMapping("/courses-list/lessons.get/{id}")
    fun getLessonForList(
        @PathVariable id: String
    ): Mono<ResponseEntity<LessonGetListResponse>> {
        return lessonRepository.findById(id)
            .switchIfEmpty {
                Mono.empty()
            }
            .flatMap { lesson ->
                Mono.just(
                    LessonGetListResponse(
                        _id = lesson._id,
                        imageUrl = lesson.imageUrl,
                        sectionId = lesson.sectionId,
                        synopsisText = lesson.synopsisText,
                        time = lesson.time,
                        title = lesson.title,
                        videoId = lesson.videoId
                    )
                )
            }
            .map { ResponseEntity.ok(it) }
            .defaultIfEmpty(ResponseEntity.notFound().build())
    }

}
