package eduflow.admin.course.controllers

import eduflow.admin.course.dto.course.CourseCreateRequest
import eduflow.admin.course.dto.course.CourseUpdateRequest
import eduflow.admin.course.dto.course.id.CourseGetByIdResponse
import eduflow.admin.course.dto.course.id.CourseGetByIdSmallResponse
import eduflow.admin.course.models.course.CourseModel
import eduflow.admin.course.repositories.course.CourseRepository
import eduflow.admin.course.services.course.CourseService
import eduflow.admin.dto.PaginationRequest
import eduflow.admin.services.AuthenticationService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/courses-hub")
class CourseHubController(
    private val courseService: CourseService,
    private val courseRepository: CourseRepository,
    private val authenticationService: AuthenticationService
) {
    @GetMapping("/courses.get/{id}")
    fun getCourseById(
        @PathVariable id: String,
        @RequestParam(name = "isSmall", required = true) isSmall: Boolean,
        @RequestParam(required = false) versionId: String?
    ): Mono<ResponseEntity<out CourseGetByIdResponse>> {
        return courseService.getCourseById(id, isSmall, versionId)
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
        val user = authenticationService.getCurrentUser()
        return courseService.create(course, user)
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
                    tags = course.tags,
                    isPublished = course.isPublished
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
