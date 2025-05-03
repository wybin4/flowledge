package eduflow.admin.course.services

import eduflow.admin.course.dto.course.id.CourseGetByIdResponse
import eduflow.admin.course.dto.course.id.CourseGetByIdSmallResponse
import eduflow.admin.course.mappers.CourseMapper
import eduflow.admin.course.models.CourseModel
import eduflow.admin.course.repositories.CourseLessonRepository
import eduflow.admin.course.repositories.CourseSectionRepository
import eduflow.admin.course.repositories.course.CourseRepository
import eduflow.admin.course.repositories.tag.CourseTagRepository
import eduflow.admin.course.types.SectionWithLessons
import eduflow.admin.services.PaginationAndSortingService
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
    private val tagRepository: CourseTagRepository
) : PaginationAndSortingService() {
    fun getCourses(
        options: Map<String, Any>, userId: String? = null, excludedIds: List<String>? = null
    ): Mono<List<CourseGetByIdSmallResponse>> {
        return this.getPaginatedAndSorted(
            options,
            courseRepository,
            criteriaModifier = { criteria ->
                if (!excludedIds.isNullOrEmpty()) {
                    criteria.and("_id").nin(excludedIds)
                } else {
                    criteria
                }
            }
        ) { courses ->
            getUpdatedTags(courses).map { updatedTags ->
                courses.map { course ->
                    courseMapper.toGetSmallDto(
                        course.copy(tags = updatedTags[course._id]), userId != null
                    )
                }
            }
        }
    }

    private fun getUpdatedTags(courses: List<CourseModel>): Mono<Map<String, List<String>>> {
        val tagIds = courses.flatMap { it.tags ?: emptyList() }.distinct()

        return tagRepository.findByIdIn(tagIds).collectList().map { tags ->
            val tagMap = tags.associateBy { it._id }

            courses.associate { course ->
                course._id to (course.tags?.mapNotNull { tagId ->
                    tagMap[tagId]?.name
                } ?: emptyList())
            }
        }
    }

    fun getCourseById(
        id: String,
        isSmall: Boolean,
        userId: String? = null,
    ): Mono<ResponseEntity<out CourseGetByIdResponse>> {
        val isUser = userId != null
        return courseRepository.findById(id).flatMap { course ->
            if (isUser) {
                getUpdatedTags(listOf(course)).flatMap { updatedTags ->
                    val updatedCourse = course.copy(tags = updatedTags[course._id] ?: emptyList())
                    processCourse(updatedCourse, isSmall, isUser, id)
                }
            } else {
                if (!isSmall) {
                    getUpdatedTags(listOf(course)).flatMap { updatedTags ->
                        val updatedCourse = course.copy(tags = updatedTags[course._id] ?: emptyList())
                        processCourse(updatedCourse, isSmall, isUser, id)
                    }
                } else {
                    processCourse(course, isSmall, isUser, id)
                }
            }
        }.switchIfEmpty(Mono.just(ResponseEntity.notFound().build()))
    }

    private fun processCourse(
        course: CourseModel,
        isSmall: Boolean,
        isUser: Boolean,
        courseId: String
    ): Mono<ResponseEntity<out CourseGetByIdResponse>> {
        return when (isSmall) {
            true -> {
                Mono.just(
                    ResponseEntity.ok(courseMapper.toGetSmallDto(course, isUser))
                )
            }

            false -> {
                val sectionsMono = if (isUser) {
                    sectionRepository.findByCourseIdAndIsVisible(courseId, isUser).collectList()
                } else {
                    sectionRepository.findByCourseId(courseId).collectList()
                }
                val lessonsMono = sectionsMono.flatMap { sections ->
                    val sectionIds = sections.map { it._id }
                    if (isUser) {
                        lessonRepository.findByCourseIdOrSectionIdsAndIsVisible(
                            courseId, sectionIds, isUser
                        ).collectList()
                    } else {
                        lessonRepository.findByCourseIdOrSectionIds(
                            courseId, sectionIds
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
                        subscriptionService.getEditorsByCourseId(courseId)
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
    }
}