package eduflow.admin.course.controllers

import eduflow.admin.course.dto.course.CourseCreateRequest
import eduflow.admin.course.dto.course.CourseUpdateRequest
import eduflow.admin.course.dto.course.id.CourseGetByIdResponse
import eduflow.admin.course.dto.course.id.CourseGetByIdSmallResponse
import eduflow.admin.course.models.CourseModel
import eduflow.admin.course.repositories.course.CourseRepository
import eduflow.admin.course.services.CourseService
import eduflow.admin.dto.PaginationRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono
import java.util.*

@RestController
@RequestMapping("/api/courses-hub")
class CourseHubController(
    private val courseService: CourseService,
    private val courseRepository: CourseRepository
) {
    @GetMapping("/courses.get/{id}")
    fun getCourseById(
        @PathVariable id: String,
        @RequestParam(name = "isSmall", required = true) isSmall: Boolean
    ): Mono<ResponseEntity<out CourseGetByIdResponse>> {
        return courseService.getCourseById(id, isSmall)
    }

    @GetMapping("/courses.get")
    fun getAllCourses(params: PaginationRequest): Mono<ResponseEntity<List<CourseGetByIdSmallResponse>>> {
        return courseService.getCourses(params.toMap())
            .map { ResponseEntity.ok(it) }
    }

    @GetMapping("/courses.count")
    fun getCoursesCount(@RequestParam(required = false) searchQuery: String?): Mono<ResponseEntity<Long>> {
        return courseRepository.countByTitleContainingIgnoreCase(searchQuery)
            .map { ResponseEntity.ok(it) }
    }

    @PostMapping("/courses.create")
    fun createCourse(@RequestBody course: CourseCreateRequest): Mono<ResponseEntity<CourseModel>> {
        val newCourse = CourseModel(
            _id = UUID.randomUUID().toString(),
            title = course.title,
            description = course.description,
            imageUrl = course.imageUrl,
            u = course.u,
            createdAt = Date(),
            updatedAt = Date()
        )
        return courseRepository.save(newCourse)
            .map { ResponseEntity.ok(it) }
    }

    @PostMapping("/courses.update/{id}")
    fun updateCourse(
        @PathVariable id: String,
        @RequestBody course: CourseUpdateRequest
    ): Mono<ResponseEntity<CourseModel>> {
        return courseRepository.findById(id)
            .flatMap { existingCourse ->
                val updatedCourse = existingCourse.copy(
                    title = course.title,
                    description = course.description,
                    imageUrl = course.imageUrl,
                    tags = course.tags
                )
                courseRepository.save(updatedCourse)
            }
            .map { ResponseEntity.ok(it) }
            .defaultIfEmpty(ResponseEntity.notFound().build())
    }

    @DeleteMapping("/courses.delete/{id}")
    fun deleteCourse(@PathVariable id: String): Mono<ResponseEntity<Void>> {
        return courseRepository.deleteById(id)
            .then(Mono.just<ResponseEntity<Void>>(ResponseEntity.noContent().build()))
            .onErrorResume { Mono.just(ResponseEntity.notFound().build()) }
    }
}
