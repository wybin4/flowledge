package eduflow.admin.course.services

import eduflow.admin.course.dto.course.get.CourseGetByIdResponse
import eduflow.admin.course.dto.course.get.CourseGetByIdSmallResponse
import eduflow.admin.course.mappers.CourseMapper
import eduflow.admin.course.models.CourseModel
import eduflow.admin.course.repositories.CourseLessonRepository
import eduflow.admin.course.repositories.CourseRepository
import eduflow.admin.course.repositories.CourseSectionRepository
import eduflow.admin.course.repositories.CourseSubscriptionRepository
import eduflow.admin.course.types.SectionWithLessons
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.ResponseEntity

@Service
class CourseService(
    private val courseRepository: CourseRepository,
    private val courseSubscriptionRepository: CourseSubscriptionRepository,
    private val courseMapper: CourseMapper,
    private val sectionRepository: CourseSectionRepository,
    private val lessonRepository: CourseLessonRepository
) {
   fun getCourses(
       options: Map<String, Any>,
       userId: String? = null,
   ): Mono<List<CourseGetByIdSmallResponse>> {
        val page = options["page"] as? Int ?: 1
        val pageSize = options["pageSize"] as? Int ?: 10
        val searchQuery = options["searchQuery"] as? String
        val sortQuery = options["sortQuery"] as? String

        val (sortField, sortOrder) = if (sortQuery.isNullOrEmpty()) {
            "createdAt" to Sort.Direction.DESC
        } else {
            sortQuery.split(":").let { it[0] to if (it.getOrElse(1) { "bottom" } == "top") Sort.Direction.ASC else Sort.Direction.DESC }
        }
        val pageable = PageRequest.of(page - 1, pageSize, Sort.by(sortOrder, sortField))

       val filteredOptions = mutableMapOf<String, Any>()
        options.forEach { (key, value) ->
            when (key) {
                "page", "pageSize", "searchQuery", "sortQuery" -> {
                    // Эти параметры уже обработаны выше, пропускаем их
                }
                else -> {
                    // Добавляем остальные параметры в filteredOptions
                    filteredOptions[key] = value
                }
            }
        }

        return courseRepository.findByTitleContainingIgnoreCaseWithCustomOptions(searchQuery ?: "", pageable, filteredOptions)
            .collectList()
            .flatMap { courses ->
                if (userId != null) {
                    val courseIds = courses.map { it._id }
                    courseSubscriptionRepository.findByCourseIdInAndUserId(courseIds, userId)
                        .collectList()
                        .map { subscriptions ->
                            courses.map { course ->
                                val subscription = subscriptions.find { it.courseId == course._id }
                                courseMapper.toGetSmallDto(course, subscription)
                            }
                        }
                } else {
                    Mono.just(courses.map { course ->
                        courseMapper.toGetSmallDto(course, null)
                    })
                }
            }
    }

    fun getCourseById(
        id: String,
        isSmall: Boolean,
        userId: String? = null,
    ): Mono<ResponseEntity<out CourseGetByIdResponse>> {
        return courseRepository.findById(id)
            .flatMap { course ->
                val subscription = if (userId != null) {
                    courseSubscriptionRepository.findByCourseIdAndUserId(id, userId)
                } else {
                    Mono.empty()
                }

                when (isSmall) {
                   true -> subscription
                    .flatMap { sub ->
                        Mono.just(
                            ResponseEntity.ok(courseMapper.toGetSmallDto(course, sub))
                        )
                    }
                    .switchIfEmpty(
                        Mono.just(
                            ResponseEntity.ok(courseMapper.toGetSmallDto(course, null))
                        )
                    )

                    false -> {
                        val isVisible = userId != null
                        val sectionsMono = if (isVisible) {
                            sectionRepository.findByCourseIdAndIsVisible(id, isVisible).collectList()
                        } else {
                            sectionRepository.findByCourseId(id).collectList()
                        }
                        val lessonsMono = sectionsMono.flatMap { sections ->
                            val sectionIds = sections.map { it._id }
                            if (isVisible) {
                                lessonRepository.findByCourseIdOrSectionIdsAndIsVisible(
                                    id, sectionIds, isVisible
                                ).collectList()
                            } else {
                                lessonRepository.findByCourseIdOrSectionIds(
                                    id, sectionIds
                                ).collectList()
                            }
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

                                 subscription
                                    .flatMap { sub ->
                                        Mono.just(
                                            courseMapper.toGetByIdBigDto(
                                                model = course,
                                                sections = lessonsInSections,
                                                lessons = standaloneLessons,
                                                subscription = sub
                                            ) as CourseGetByIdResponse
                                        )
                                    }
                                    .switchIfEmpty(
                                        Mono.just(
                                            courseMapper.toGetByIdBigDto(
                                                model = course,
                                                sections = lessonsInSections,
                                                lessons = standaloneLessons
                                            ) as CourseGetByIdResponse
                                        )
                                    )
                            }
                            .map { ResponseEntity.ok(it) }
                    }
                }
            }
            .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()))
    }
}