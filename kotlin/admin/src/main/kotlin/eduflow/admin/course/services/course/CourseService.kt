package eduflow.admin.course.services.course

import eduflow.admin.course.dto.course.id.CourseGetByIdResponse
import eduflow.admin.course.dto.course.id.CourseGetByIdSmallResponse
import eduflow.admin.course.mappers.CourseMapper
import eduflow.admin.course.models.course.CourseModel
import eduflow.admin.course.repositories.CourseSectionRepository
import eduflow.admin.course.repositories.course.CourseRepository
import eduflow.admin.course.repositories.lessons.CourseLessonRepository
import eduflow.admin.course.services.CourseTagService
import eduflow.admin.course.services.subscription.CourseSubscriptionService
import eduflow.admin.course.types.SectionWithLessons
import eduflow.admin.services.PaginationAndSortingService
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class CourseService(
    private val courseRepository: CourseRepository,
    private val courseMapper: CourseMapper,
    private val courseVersionService: CourseVersionService,
    private val lessonRepository: CourseLessonRepository,
    private val subscriptionService: CourseSubscriptionService,
    private val tagService: CourseTagService,
    private val sectionRepository: CourseSectionRepository
) : PaginationAndSortingService() {
    fun getCourses(
        options: Map<String, Any>,
        userId: String? = null,
        filteredIds: List<String>? = null
    ): Mono<List<CourseGetByIdSmallResponse>> {
        return this.getPaginatedAndSorted(
            options,
            courseRepository,
            criteriaModifier = { criteria ->
                if (filteredIds != null) {
                    criteria.and("_id").`in`(filteredIds)
                } else {
                    criteria
                }
            }
        ) { courses ->
            tagService.getUpdatedTagsByCourses(courses).map { updatedTags ->
                courses.map { course ->
                    courseMapper.toGetSmallDto(
                        course.updateTags(updatedTags), userId != null
                    )
                }
            }
        }
    }

    fun getCourseById(
        id: String,
        isSmall: Boolean,
        userId: String? = null,
        version: String = "latest"
    ): Mono<ResponseEntity<out CourseGetByIdResponse>> {
        val isUser = userId != null
        return courseRepository.findById(id).flatMap { course ->
            if (!isSmall) {
                tagService.getUpdatedTagsByCourse(course).flatMap { updatedTags ->
                    processCourse(course.updateTags(updatedTags), isSmall, isUser, id, version)
                }
            } else {
                processCourse(course, isSmall, isUser, id, version)
            }
        }.switchIfEmpty(Mono.just(ResponseEntity.notFound().build()))
    }

    private fun processCourse(
        course: CourseModel,
        isSmall: Boolean,
        isUser: Boolean,
        courseId: String,
        version: String
    ): Mono<ResponseEntity<out CourseGetByIdResponse>> {
        return when (isSmall) {
            true -> Mono.just(ResponseEntity.ok(courseMapper.toGetSmallDto(course, isUser)))
            false -> {
                val targetVersion = courseVersionService.getTargetVersion(course, version)
                if (targetVersion == null) {
                    return Mono.error(NoSuchElementException("Версия не найдена"))
                }

                val versionSections = targetVersion.sections ?: emptyList()
                val sectionIds = versionSections.map { it._id }
                val lessonIds = versionSections.flatMap { it.lessons ?: emptyList() }

                if (lessonIds.isEmpty()) {
                    sectionRepository.findByIdIn(sectionIds)
                        .collectList()
                        .flatMap { sections ->
                            val sortedSections = versionSections.map { versionSection ->
                                sections.find { it._id == versionSection._id }
                                    ?: throw NoSuchElementException("Секция не найдена")
                            }

                            val sectionsWithEmptyLessons = sortedSections.map { section ->
                                SectionWithLessons(
                                    section = section,
                                    lessons = emptyList()
                                )
                            }

                            if (!isUser) {
                                subscriptionService.getEditorsByCourseId(courseId)
                                    .collectList()
                                    .map { editors ->
                                        courseMapper.toCoursesHubGetByIdBigDto(
                                            model = course,
                                            sectionModels = sectionsWithEmptyLessons,
                                            editors = editors
                                        )
                                    }
                            } else {
                                Mono.just(
                                    courseMapper.toCoursesListGetByIdBigDto(
                                        model = course,
                                        sectionModels = sectionsWithEmptyLessons,
                                    ) as CourseGetByIdResponse
                                )
                            }
                        }
                } else {
                    val lessonsMono = if (isUser) {
                        lessonRepository.findByIdInAndIsVisible(lessonIds, isUser).collectList()
                    } else {
                        lessonRepository.findByIdIn(lessonIds).collectList()
                    }

                    lessonsMono.flatMap { allLessons ->
                        sectionRepository.findByIdIn(sectionIds)
                            .collectList()
                            .flatMap { sections ->
                                // Сортируем секции в порядке, указанном в документе курса
                                val sortedSections = versionSections.map { versionSection ->
                                    sections.find { it._id == versionSection._id }
                                        ?: throw NoSuchElementException("Секция не найдена")
                                }

                                val sectionsWithLessons = sortedSections.map { section ->
                                    val versionSection = versionSections.find { it._id == section._id }
                                        ?: throw NoSuchElementException("Секция не найдена в версии")

                                    // Сортируем уроки в порядке, указанном в документе курса
                                    val sortedLessons = versionSection.lessons?.mapNotNull { lessonId ->
                                        allLessons.find { it._id == lessonId }
                                    } ?: emptyList()

                                    SectionWithLessons(
                                        section = section,
                                        lessons = sortedLessons
                                    )
                                }

                                if (!isUser) {
                                    subscriptionService.getEditorsByCourseId(courseId)
                                        .collectList()
                                        .map { editors ->
                                            courseMapper.toCoursesHubGetByIdBigDto(
                                                model = course,
                                                sectionModels = sectionsWithLessons,
                                                editors = editors
                                            )
                                        }
                                } else {
                                    Mono.just(
                                        courseMapper.toCoursesListGetByIdBigDto(
                                            model = course,
                                            sectionModels = sectionsWithLessons,
                                        ) as CourseGetByIdResponse
                                    )
                                }
                            }
                    }
                }.map { ResponseEntity.ok(it) }
            }
        }
    }
}