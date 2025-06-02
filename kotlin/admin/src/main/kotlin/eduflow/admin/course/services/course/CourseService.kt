package flowledge.admin.course.services.course

import flowledge.admin.course.dto.course.CourseCreateRequest
import flowledge.admin.course.dto.course.id.CourseGetByIdResponse
import flowledge.admin.course.dto.course.id.CourseGetByIdSmallResponse
import flowledge.admin.course.dto.course.section.CourseGetLessonResponse
import flowledge.admin.course.dto.course.section.CourseGetSectionResponse
import flowledge.admin.course.dto.course.section.SectionWithLessonsResponse
import flowledge.admin.course.mappers.CourseMapper
import flowledge.admin.course.models.course.CourseModel
import flowledge.admin.course.models.course.version.CourseVersionModel
import flowledge.admin.course.models.course.version.CourseVersionSectionModel
import flowledge.admin.course.models.subscription.CourseSubscriptionModel
import flowledge.admin.course.repositories.CourseSectionRepository
import flowledge.admin.course.repositories.course.CourseRepository
import flowledge.admin.course.repositories.course.version.CourseVersionRepository
import flowledge.admin.course.repositories.lessons.CourseLessonRepository
import flowledge.admin.course.repositories.subscription.CourseSubscriptionRepository
import flowledge.admin.course.services.CourseTagService
import flowledge.admin.course.services.subscription.CourseSubscriptionService
import flowledge.admin.services.PaginationAndSortingService
import flowledge.admin.user.models.UserModel
import flowledge.user.DefaultRoles
import flowledge.user.toLowerCase
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
class CourseService(
    private val courseRepository: CourseRepository,
    private val courseMapper: CourseMapper,
    private val courseVersionService: CourseVersionService,
    private val lessonRepository: CourseLessonRepository,
    private val subscriptionService: CourseSubscriptionService,
    private val tagService: CourseTagService,
    private val sectionRepository: CourseSectionRepository,
    private val subscriptionRepository: CourseSubscriptionRepository,
    private val versionRepository: CourseVersionRepository
) : PaginationAndSortingService() {
    private fun getVersionNames(versionIds: List<String>): Mono<Map<String, String>> {
        return versionRepository.findByIdIn(versionIds)
            .map { it._id to it.name }
            .collectMap({ it.first }, { it.second })
    }

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
            tagService.getUpdatedTagsByCourses(courses).flatMap { updatedTags ->
                val versionIds = courses.mapNotNull { it.versions.lastOrNull() }
                getVersionNames(versionIds).flatMap { versionNames ->
                    val responses = courses.map { course ->
                        val latestVersionId = course.versions.lastOrNull()
                        val versionName = versionNames[latestVersionId] ?: "0.0"
                        Mono.just(
                            courseMapper.toGetSmallDto(
                                course.updateTags(updatedTags),
                                userId != null,
                                versionName
                            )
                        )
                    }
                    Flux.merge(responses).collectList()
                }
            }
        }
    }

    fun create(
        course: CourseCreateRequest,
        user: UserModel
    ): Mono<ResponseEntity<CourseModel>> {
        val firstVersion = CourseVersionModel.create(isMajor = false)
        val newCourse = CourseModel.create(
            title = course.title,
            description = course.description,
            imageUrl = course.imageUrl,
            user = user,
            firstVersionId = firstVersion._id
        )

        return versionRepository.save(firstVersion)
            .flatMap { _ ->
                courseRepository.save(newCourse)
                    .flatMap { savedCourse ->
                        subscriptionRepository.save(
                            CourseSubscriptionModel.create(
                                userId = user._id,
                                courseId = savedCourse._id,
                                isSubscribed = true,
                                roles = listOf(DefaultRoles.OWNER.toLowerCase())
                            )
                        ).map { ResponseEntity.ok(savedCourse) }
                    }
            }
    }

    fun getCourseById(
        id: String,
        isSmall: Boolean,
        userId: String? = null,
        versionId: String? = null
    ): Mono<ResponseEntity<out CourseGetByIdResponse>> {
        val isUser = userId != null
        return processCourse(id, isSmall, isUser, versionId)
            .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()))
    }

    private fun processCourse(
        courseId: String,
        isSmall: Boolean,
        isUser: Boolean,
        versionId: String? = null
    ): Mono<ResponseEntity<out CourseGetByIdResponse>> {
        return when (isSmall) {
            true -> {
                courseRepository.findById(courseId).flatMap { course ->
                    val targetVersionId = versionId ?: course.versions.lastOrNull()
                    if (targetVersionId != null) {
                        getVersionNames(listOf(targetVersionId)).flatMap { versionNames ->
                            val versionName = versionNames[targetVersionId] ?: "0.0"
                            Mono.just(ResponseEntity.ok(courseMapper.toGetSmallDto(course, isUser, versionName)))
                        }
                    } else {
                        Mono.just(ResponseEntity.ok(courseMapper.toGetSmallDto(course, isUser, "0.0")))
                    }
                }
            }

            false -> {
                courseVersionService.getTargetVersionPair(courseId, versionId) { course, version ->
                    Mono.just(course to version)
                }.flatMap { (course, targetVersion) ->
                    tagService.getUpdatedTagsByCourse(course)
                        .flatMap { updatedTags ->
                            val updatedCourse = course.updateTags(updatedTags)
                            processFullCourse(updatedCourse, targetVersion, isUser, courseId)
                        }
                }.map { response ->
                    ResponseEntity.ok(response)
                }
            }
        }
    }

    private fun processFullCourse(
        updatedCourse: CourseModel,
        targetVersion: CourseVersionModel,
        isUser: Boolean,
        courseId: String
    ): Mono<CourseGetByIdResponse> {
        val versionSections = targetVersion.sections ?: emptyList()
        val sectionIds = versionSections.map { it._id }
        val lessonIds = versionSections.flatMap { it.lessons?.map { it._id } ?: emptyList() }

        return if (lessonIds.isEmpty()) {
            processSectionsWithoutLessons(
                updatedCourse,
                targetVersion,
                isUser,
                courseId,
                versionSections,
                sectionIds
            )
        } else {
            processSectionsWithLessons(
                updatedCourse,
                targetVersion,
                isUser,
                courseId,
                versionSections,
                sectionIds,
                lessonIds
            )
        }
    }

    private fun processSectionsWithoutLessons(
        updatedCourse: CourseModel,
        targetVersion: CourseVersionModel,
        isUser: Boolean,
        courseId: String,
        versionSections: List<CourseVersionSectionModel>,
        sectionIds: List<String>
    ): Mono<CourseGetByIdResponse> {
        return sectionRepository.findByIdIn(sectionIds)
            .collectList()
            .flatMap { sectionsFromRepo ->
                val sectionsWithEmptyLessons = versionSections.map { versionSection ->
                    val sectionFromRepo = sectionsFromRepo.find { it._id == versionSection._id }
                        ?: throw NoSuchElementException("Секция не найдена")

                    SectionWithLessonsResponse(
                        section = CourseGetSectionResponse(
                            _id = sectionFromRepo._id,
                            title = sectionFromRepo.title,
                            isVisible = versionSection.isVisible
                        ),
                        lessons = emptyList()
                    )
                }

                mapToResponse(updatedCourse, targetVersion, isUser, courseId, sectionsWithEmptyLessons)
            }
    }

    private fun processSectionsWithLessons(
        updatedCourse: CourseModel,
        targetVersion: CourseVersionModel,
        isUser: Boolean,
        courseId: String,
        versionSections: List<CourseVersionSectionModel>,
        sectionIds: List<String>,
        lessonIds: List<String>
    ): Mono<CourseGetByIdResponse> {
        return lessonRepository.findByIdIn(lessonIds).collectList()
            .flatMap { lessonsFromRepo ->
                sectionRepository.findByIdIn(sectionIds)
                    .collectList()
                    .flatMap { sectionsFromRepo ->
                        val sectionsWithLessons = versionSections.map { versionSection ->
                            val sectionFromRepo = sectionsFromRepo.find { it._id == versionSection._id }
                                ?: throw NoSuchElementException("Секция не найдена")

                            val lessonsFromVersion = versionSection.lessons ?: emptyList()

                            val mergedLessons = lessonsFromVersion.mapNotNull { lessonFromVersion ->
                                val lessonFromRepo = lessonsFromRepo.find { it._id == lessonFromVersion._id }
                                if (lessonFromRepo != null && (!isUser || lessonFromVersion.isVisible == true)) {
                                    CourseGetLessonResponse(
                                        _id = lessonFromVersion._id,
                                        title = lessonFromRepo.title,
                                        time = lessonFromRepo.time,
                                        imageUrl = lessonFromRepo.imageUrl,
                                        isVisible = lessonFromVersion.isVisible,
                                        hasSynopsis = lessonFromRepo.synopsisText?.isNotEmpty() == true,
                                        isDraft = lessonFromVersion.isDraft,
                                        surveyId = lessonFromVersion.surveyId,
                                        videoId = lessonFromVersion.videoId
                                    )
                                } else {
                                    null
                                }
                            }

                            SectionWithLessonsResponse(
                                section = CourseGetSectionResponse(
                                    _id = sectionFromRepo._id,
                                    title = sectionFromRepo.title,
                                    isVisible = versionSection.isVisible
                                ),
                                lessons = mergedLessons
                            )
                        }

                        mapToResponse(updatedCourse, targetVersion, isUser, courseId, sectionsWithLessons)
                    }
            }
    }

    private fun mapToResponse(
        updatedCourse: CourseModel,
        targetVersion: CourseVersionModel,
        isUser: Boolean,
        courseId: String,
        sectionsWithLessons: List<SectionWithLessonsResponse>
    ): Mono<CourseGetByIdResponse> {
        return if (!isUser) {
            subscriptionService.getEditorsByCourseId(courseId)
                .collectList()
                .map { editors ->
                    courseMapper.toCoursesHubGetByIdBigDto(
                        model = updatedCourse,
                        sectionModels = sectionsWithLessons,
                        editors = editors ?: emptyList(),
                        versionId = targetVersion._id,
                        versionName = targetVersion.name
                    )
                }
        } else {
            Mono.just(
                courseMapper.toCoursesListGetByIdBigDto(
                    model = updatedCourse,
                    sectionModels = sectionsWithLessons,
                    versionId = targetVersion._id,
                    versionName = targetVersion.name
                )
            )
        }
    }
}