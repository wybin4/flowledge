package eduflow.admin.course.controllers

import eduflow.admin.course.models.CourseModel
import eduflow.admin.course.repositories.CourseRepository
import eduflow.admin.course.services.CourseService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/courses-list")
class CourseListController(
    private val courseService: CourseService,
    private val courseRepository: CourseRepository
) {
    @GetMapping("/courses.get")
    fun getAllCourses(
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "10") pageSize: Int,
        @RequestParam(required = false) searchQuery: String?,
        @RequestParam(required = false) sortQuery: String?
    ): Mono<ResponseEntity<List<CourseModel>>> {
         val options = mapOf(
            "page" to page as Any,
            "pageSize" to pageSize as Any,
            "searchQuery" to searchQuery as Any,
            "sortQuery" to sortQuery as Any
        )

        return courseService.getCourses(options)
            .map { ResponseEntity.ok(it) }
    }

    @PostMapping("/courses.toggle-favourite/{id}")
    fun toggleFavouriteCourse(
        @PathVariable id: String
    ): Mono<ResponseEntity<Unit>> {
        return courseRepository.findById(id)
            .flatMap { course ->
                course.isFavourite = course.isFavourite?.not() ?: true
                courseRepository.save(course).thenReturn(Unit)
            }
            .map { ResponseEntity.ok(it) }
    }
}
