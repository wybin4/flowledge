package eduflow.admin.controllers

import eduflow.admin.dto.CourseCreateRequest
import eduflow.admin.models.CourseCreatorModel
import eduflow.admin.models.CourseModel
import eduflow.admin.repositories.CourseRepository
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono
import java.util.*

@RestController
@RequestMapping("/api/courses-hub")
class CourseController(private val courseRepository: CourseRepository) {

    @GetMapping("/{id}")
    fun getCourseById(@PathVariable id: String): Mono<ResponseEntity<CourseModel>> {
        return courseRepository.findById(id)
            .map { ResponseEntity.ok(it) }
            .defaultIfEmpty(ResponseEntity.notFound().build())
    }

    @GetMapping
    fun getAllCourses(
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "10") pageSize: Int,
        @RequestParam(required = false) searchQuery: String?,
        @RequestParam(required = false) sortQuery: String?
    ): Mono<ResponseEntity<List<CourseModel>>> {
        val (sortField, sortOrder) = if (sortQuery.isNullOrEmpty()) {
            "createdAt" to Sort.Direction.DESC
        } else {
            sortQuery.split(":").let { it[0] to if (it.getOrElse(1) { "bottom" } == "top") Sort.Direction.ASC else Sort.Direction.DESC }
        }
        val pageable = PageRequest.of(page - 1, pageSize, Sort.by(sortOrder, sortField))

        return courseRepository.findByTitleContainingIgnoreCase(searchQuery ?: "", pageable)
            .collectList()
            .map { ResponseEntity.ok(it) }
    }

    @GetMapping("/count")
    fun getCoursesCount(@RequestParam(required = false) searchQuery: String?): Mono<ResponseEntity<Long>> {
        return courseRepository.countByTitleContainingIgnoreCase(searchQuery)
            .map { ResponseEntity.ok(it) }
    }

    @PostMapping
    fun createCourse(@RequestBody course: CourseCreateRequest): Mono<ResponseEntity<CourseModel>> {
        val newCourse = CourseModel(
            _id = UUID.randomUUID().toString(),
            title = course.title,
            description = course.description,
            u = course.u,
            createdAt = Date(),
            updatedAt = Date()
        )
        return courseRepository.save(newCourse)
            .map { ResponseEntity.ok(it) }
    }

    @PutMapping("/{id}")
    fun updateCourse(@PathVariable id: String, @RequestBody course: CourseModel): Mono<ResponseEntity<CourseModel>> {
        return courseRepository.findById(id)
            .flatMap { existingCourse ->
                val updatedCourse = existingCourse.copy(
                    title = course.title,
                    description = course.description
                )
                courseRepository.save(updatedCourse)
            }
            .map { ResponseEntity.ok(it) }
            .defaultIfEmpty(ResponseEntity.notFound().build())
    }

    @DeleteMapping("/{id}")
    fun deleteCourse(@PathVariable id: String): Mono<Void> {
        return courseRepository.deleteById(id)
    }
}
