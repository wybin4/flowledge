package eduflow.admin.course.controllers

import eduflow.admin.course.dto.lesson.LessonCreateRequest
import eduflow.admin.course.dto.lesson.LessonUpdateRequest
import eduflow.admin.course.models.CourseLessonModel
import eduflow.admin.course.repositories.CourseLessonRepository
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
    fun createLesson(@RequestBody lesson: LessonCreateRequest): Mono<CourseLessonModel> {
        val newLesson = CourseLessonModel(
            _id = UUID.randomUUID().toString(),
            title = lesson.title,
            courseId = lesson.courseId,
            sectionId = lesson.sectionId,
            videoId = lesson.videoId,
            isVisible = lesson.isVisible,
            imageUrl = lesson.imageUrl,
            time = lesson.time,
            createdAt = Date(),
            updatedAt = Date()
        )
        return lessonRepository.save(newLesson)
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
