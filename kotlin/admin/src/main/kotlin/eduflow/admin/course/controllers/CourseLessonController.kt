package eduflow.admin.course.controllers

import eduflow.admin.course.dto.lesson.LessonCreateDraftRequest
import eduflow.admin.course.dto.lesson.LessonCreateResponse
import eduflow.admin.course.dto.lesson.LessonUpdateRequest
import eduflow.admin.course.models.CourseLessonModel
import eduflow.admin.course.repositories.CourseLessonRepository
import eduflow.user.Language
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono
import java.util.*

@RestController
@RequestMapping("/api/courses-hub")
class CourseLessonController(
    private val lessonRepository: CourseLessonRepository,
) {

   @PostMapping("/lessons.create")
    fun createLesson(
        @RequestParam(required = false) draft: Boolean?,
        @RequestBody lesson: LessonCreateDraftRequest
    ): Mono<LessonCreateResponse> {
        if (draft == true) {
            if (lesson.videoId == null && (lesson.synopsis != null || lesson.survey != null)) {
                throw IllegalArgumentException("synopsis and surveyText require videoId")
            }
            if (lesson.survey != null && lesson.synopsis == null) {
                throw IllegalArgumentException("surveyText requires synopsis")
            }

            val locale = Language.RU // TODO: get from user document

            val draftCount = if (lesson.courseId != null) {
                lessonRepository.countByCourseIdAndIsDraft(lesson.courseId, true).block() ?: 0
            } else if (lesson.sectionId != null) {
                lessonRepository.countBySectionIdAndIsDraft(lesson.sectionId, true).block() ?: 0
            } else {
                throw IllegalArgumentException("Either courseId or sectionId must be provided")
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
                isVisible = lesson.isVisible ?: false,
                synopsis = lesson.synopsis,
                surveyText = lesson.survey,
                createdAt = Date(),
                updatedAt = Date(),
                isDraft = true
            )

            return lessonRepository.save(newLesson)
            .map { savedLesson -> LessonCreateResponse(savedLesson._id) }
        } else {
            TODO()
        }
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
