package eduflow.admin.course.controllers

import eduflow.admin.course.dto.lesson.*
import eduflow.admin.course.dto.lesson.create.LessonAddDetailsRequest
import eduflow.admin.course.dto.lesson.create.LessonCreateDraftRequest
import eduflow.admin.course.dto.lesson.create.LessonCreateDraftResponse
import eduflow.admin.course.dto.lesson.create.LessonCreateRequest
import eduflow.admin.course.models.CourseLessonModel
import eduflow.admin.course.repositories.CourseLessonRepository
import eduflow.user.Language
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import reactor.core.publisher.Mono
import java.util.*

@RestController
@RequestMapping("/api/courses-hub")
class CourseLessonController(
    private val lessonRepository: CourseLessonRepository,
) {

    @PostMapping("/lessons.create")
    fun createLesson(
        @RequestBody lesson: LessonCreateRequest
    ): Mono<*> {
        return when (lesson) {
            is LessonCreateDraftRequest -> {
                try {
                    createDraft(lesson)
                } catch (e: IllegalArgumentException) {
                    Mono.error<Any>(ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid request body for draft"))
                }
            }
            is LessonAddDetailsRequest -> {
                try {
                    addDetails(lesson)
                } catch (e: IllegalArgumentException) {
                    Mono.error<Any>(ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid request body for details"))
                }
            }
            else -> Mono.error<Any>(IllegalArgumentException("Invalid action parameter"))
        }
    }

    private fun createDraft(lesson: LessonCreateDraftRequest): Mono<LessonCreateDraftResponse> {
        if (lesson.videoId == null && (lesson.synopsis != null || lesson.survey != null)) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "synopsis and surveyText require videoId")
        }
        if (lesson.survey != null && lesson.synopsis == null) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "surveyText requires synopsis")
        }

        val locale = Language.RU // TODO: get from user document

        val draftCount = if (lesson.courseId != null) {
            lessonRepository.countByCourseIdAndIsDraft(lesson.courseId, true).block() ?: 0
        } else if (lesson.sectionId != null) {
            lessonRepository.countBySectionIdAndIsDraft(lesson.sectionId, true).block() ?: 0
        } else {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Either courseId or sectionId must be provided")
        }

        val title = when (locale) {
            Language.RU -> "черновик лекции ${draftCount + 1}"
            Language.EN -> "draft lecture ${draftCount + 1}"
            else -> "Draft lecture ${draftCount + 1}"
        }

        val newLesson = CourseLessonModel(
            _id = UUID.randomUUID().toString(),
            title = title,
            courseId = lesson.courseId,
            sectionId = lesson.sectionId,
            videoId = lesson.videoId,
            isVisible = false,
            synopsis = lesson.synopsis,
            surveyText = lesson.survey,
            createdAt = Date(),
            updatedAt = Date(),
            isDraft = true
        )

        return lessonRepository.save(newLesson)
        .map { savedLesson -> LessonCreateDraftResponse(savedLesson._id) }
    }

    private fun addDetails(lesson: LessonAddDetailsRequest): Mono<LessonCreateDraftResponse> {
        return lessonRepository.findById(lesson._id)
            .flatMap { existingLesson ->
                if (existingLesson.isDraft != true) {
                    return@flatMap Mono.error<CourseLessonModel>(ResponseStatusException(HttpStatus.CONFLICT, "Lesson is not in draft state"))
                }
                println(lesson)
                if (lesson.autoDetect) {
                    if (lesson.time != null || lesson.timeUnit != null) {
                        return@flatMap Mono.error<CourseLessonModel>(ResponseStatusException(HttpStatus.BAD_REQUEST, "Time and timeUnit should be null when autoDetect is true"))
                    }
                    // todo() - здесь будет логика для autoDetect
                } else {
                    if (lesson.time == null || lesson.timeUnit == null) {
                        return@flatMap Mono.error<CourseLessonModel>(ResponseStatusException(HttpStatus.BAD_REQUEST, "Time and timeUnit should not be null when autoDetect is false"))
                    }
                    existingLesson.time = "${lesson.time} ${lesson.timeUnit}"
                }

                existingLesson.isDraft = false
                existingLesson.title = lesson.title
                lessonRepository.save(existingLesson)
            }
            .map { savedLesson -> LessonCreateDraftResponse(savedLesson._id) }
    }

    @PutMapping("/lessons.update/{id}")
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

    @DeleteMapping("/lessons.delete/{id}")
    fun deleteLesson(
        @PathVariable id: String
    ): Mono<ResponseEntity<Void>> {
        return lessonRepository.deleteById(id)
            .then(Mono.just<ResponseEntity<Void>>(ResponseEntity.noContent().build()))
            .onErrorResume { _: Throwable -> 
                Mono.just(ResponseEntity.notFound().build()) 
            }
    }

}
