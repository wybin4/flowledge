package eduflow.admin.course.services

import eduflow.admin.course.dto.course.id.CourseGetByIdResponse
import eduflow.admin.course.dto.course.id.CourseGetByIdSmallResponse
import eduflow.admin.course.mappers.CourseMapper
import eduflow.admin.course.repositories.CourseLessonRepository
import eduflow.admin.course.repositories.CourseSectionRepository
import eduflow.admin.course.repositories.course.CourseRepository
import eduflow.admin.course.types.SectionWithLessons
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class CourseService(
    private val courseRepository: CourseRepository,
    private val courseMapper: CourseMapper,
    private val sectionRepository: CourseSectionRepository,
    private val lessonRepository: CourseLessonRepository,
    private val subscriptionService: CourseSubscriptionService,
) {
    fun getCourses(
        options: Map<String, Any>, userId: String? = null, excludedIds: List<String>? = null
    ): Mono<List<CourseGetByIdSmallResponse>> {
        val page = options["page"] as? Int ?: 1
        val pageSize = options["pageSize"] as? Int ?: 10
        val searchQuery = options["searchQuery"] as? String
        val sortQuery = options["sortQuery"] as? String
        val isUser = userId != null

        val (sortField, sortOrder) = if (sortQuery.isNullOrEmpty()) {
            "createdAt" to Sort.Direction.DESC
        } else {
            sortQuery.split(":")
                .let { it[0] to if (it.getOrElse(1) { "bottom" } == "top") Sort.Direction.ASC else Sort.Direction.DESC }
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
        return courseRepository.findByTitleContainingIgnoreCaseWithCustomOptions(
            searchQuery ?: "", pageable, filteredOptions, excludedIds
        ).collectList().flatMap { courses ->
            Mono.just(courses.map { course ->
                courseMapper.toGetSmallDto(course, isUser)
            })
        }
    }

    fun getCourseById(
        id: String,
        isSmall: Boolean,
        userId: String? = null,
    ): Mono<ResponseEntity<out CourseGetByIdResponse>> {
        val isUser = userId != null
        return courseRepository.findById(id).flatMap { course ->
            when (isSmall) {
                true -> {
                    Mono.just(
                        ResponseEntity.ok(courseMapper.toGetSmallDto(course, isUser))
                    )
                }

                false -> {
                    val sectionsMono = if (isUser) {
                        sectionRepository.findByCourseIdAndIsVisible(id, isUser).collectList()
                    } else {
                        sectionRepository.findByCourseId(id).collectList()
                    }
                    val lessonsMono = sectionsMono.flatMap { sections ->
                        val sectionIds = sections.map { it._id }
                        if (isUser) {
                            lessonRepository.findByCourseIdOrSectionIdsAndIsVisible(
                                id, sectionIds, isUser
                            ).collectList()
                        } else {
                            lessonRepository.findByCourseIdOrSectionIds(
                                id, sectionIds
                            ).collectList()
                        }
                    }
                    sectionsMono.zipWith(lessonsMono).flatMap { tuple ->
                        val sections = tuple.t1
                        val allLessons = tuple.t2

                        val lessonsInSections = sections.map { section ->
                            SectionWithLessons(
                                section = section,
                                lessons = allLessons.filter { lesson -> lesson.sectionId == section._id })
                        }

                        val standaloneLessons = allLessons.filter { lesson -> lesson.sectionId == null }

                        if (!isUser) {
                            subscriptionService.getEditorsByCourseId(id)
                                .collectList()
                                .map { editors ->
                                    courseMapper.toCoursesHubGetByIdBigDto(
                                        model = course,
                                        sections = lessonsInSections,
                                        lessons = standaloneLessons,
                                        editors = editors
                                    ) as CourseGetByIdResponse
                                }
                        } else {
                            Mono.just(
                                courseMapper.toCoursesListGetByIdBigDto(
                                    model = course,
                                    sections = lessonsInSections,
                                    lessons = standaloneLessons
                                ) as CourseGetByIdResponse
                            )
                        }
                    }.map { ResponseEntity.ok(it) }
                }
            }
        }.switchIfEmpty(Mono.just(ResponseEntity.notFound().build()))
    }
}