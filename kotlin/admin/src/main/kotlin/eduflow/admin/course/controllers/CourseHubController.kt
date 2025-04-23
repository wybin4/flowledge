package eduflow.admin.course.controllers

import eduflow.admin.course.dto.course.CourseCreateRequest
import eduflow.admin.course.dto.CourseUpdateRequest
import eduflow.admin.course.dto.course.get.CourseGetByIdResponse
import eduflow.admin.course.dto.course.get.CourseGetByIdSmallResponse
import eduflow.admin.course.models.CourseModel
import eduflow.admin.course.repositories.CourseRepository
import eduflow.admin.course.services.CourseService
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
    fun getAllCourses(
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "10") pageSize: Int,
        @RequestParam(required = false) searchQuery: String?,
        @RequestParam(required = false) sortQuery: String?
    ): Mono<ResponseEntity<List<CourseGetByIdSmallResponse>>> {
         val options = mapOf(
            "page" to page as Any,
            "pageSize" to pageSize as Any,
            "searchQuery" to searchQuery as Any,
            "sortQuery" to sortQuery as Any
        )

        return courseService.getCourses(options)
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

    @PutMapping("/courses.update/{id}")
    fun updateCourse(@PathVariable id: String, @RequestBody course: CourseUpdateRequest): Mono<ResponseEntity<CourseModel>> {
        return courseRepository.findById(id)
            .flatMap { existingCourse ->
                val updatedCourse = existingCourse.copy(
                    title = course.title,
                    description = course.description,
                    imageUrl = course.imageUrl,
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
