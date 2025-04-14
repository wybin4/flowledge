package eduflow.admin.course.controllers

import eduflow.admin.course.dto.course.CourseCreateRequest
import eduflow.admin.course.dto.CourseUpdateRequest
import eduflow.admin.course.dto.course.hub.get.id.CourseHubGetByIdResponse
import eduflow.admin.course.mappers.CourseMapper
import eduflow.admin.course.models.CourseModel
import eduflow.admin.course.repositories.CourseLessonRepository
import eduflow.admin.course.repositories.CourseRepository
import eduflow.admin.course.repositories.CourseSectionRepository
import eduflow.admin.course.types.SectionWithLessons
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono
import java.util.*

@RestController
@RequestMapping("/api/courses-hub")
class CourseHubController(
    private val courseRepository: CourseRepository,
    private val courseMapper: CourseMapper,
    private val sectionRepository: CourseSectionRepository,
    private val lessonRepository: CourseLessonRepository
) {

    @GetMapping("/courses.get/{id}")
    fun getCourseById(
        @PathVariable id: String,
        @RequestParam(name = "isSmall", required = true) isSmall: Boolean
    ): Mono<ResponseEntity<out CourseHubGetByIdResponse>> {
        return courseRepository.findById(id)
            .flatMap { course ->
                when (isSmall) {
                    true -> Mono.just(
                        ResponseEntity.ok(courseMapper.toHubGetByIdSmallDto(course))
                    )

                    false -> {
                        val sectionsMono = sectionRepository.findByCourseId(id).collectList()
                        val lessonsMono = sectionsMono.flatMap { sections ->
                            val sectionIds = sections.map { it._id }
                            lessonRepository.findByCourseIdOrSectionIds(id, sectionIds).collectList()
                        }

                        sectionsMono.zipWith(lessonsMono)
                            .flatMap { tuple ->
                                val sections = tuple.t1
                                val allLessons = tuple.t2

                                val lessonsInSections = sections.map { section ->
                                    SectionWithLessons(
                                        section = section,
                                        lessons = allLessons
                                            .filter { lesson -> lesson.sectionId == section._id }
                                    )
                                }

                                val standaloneLessons = allLessons
                                    .filter { lesson -> lesson.sectionId == null }

                                Mono.just(
                                    courseMapper.toHubGetByIdBigDto(
                                        model = course,
                                        sections = lessonsInSections,
                                        lessons = standaloneLessons
                                    )
                                )
                            }
                            .map { ResponseEntity.ok(it) }
                    }
                }
            }
            .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()))
    }

    @GetMapping("/courses.get")
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
