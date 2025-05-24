package eduflow.admin.course.services.lesson

import eduflow.admin.course.dto.lesson.LessonUpdateRequest
import eduflow.admin.course.dto.lesson.create.*
import eduflow.admin.course.dto.lesson.get.LessonGetHubResponse
import eduflow.admin.course.dto.lesson.get.LessonGetListResponse
import eduflow.admin.course.mappers.CourseLessonMapper
import eduflow.admin.course.models.course.version.CourseVersionLessonModel
import eduflow.admin.course.models.lesson.CourseLessonModel
import eduflow.admin.course.repositories.lessons.CourseLessonRepository
import eduflow.admin.course.services.course.CourseVersionService
import eduflow.admin.course.services.lesson.survey.CourseLessonSurveyService
import eduflow.user.Language
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import reactor.core.publisher.Mono

@Service
class CourseLessonService(
    private val lessonRepository: CourseLessonRepository,
    private val versionService: CourseVersionService,
    private val lessonVersionService: CourseVersionLessonService,
    private val lessonMapper: CourseLessonMapper,
    private val surveyService: CourseLessonSurveyService,
) {
    fun createDraft(request: LessonCreateDraftRequest, locale: Language): Mono<LessonCreateResponse> {
        return versionService.getTargetVersion(request.courseId).flatMap { latestVersion ->
            val sectionToUpdate = latestVersion.sections?.find { it._id == request.sectionId }
            if (sectionToUpdate != null) {
                val draftCount = sectionToUpdate.lessons?.count { it.isDraft == true } ?: 0

                val title = when (locale) {
                    Language.RU -> "черновик лекции ${draftCount + 1}"
                    Language.EN -> "draft lecture ${draftCount + 1}"
                    else -> "draft lecture ${draftCount + 1}"
                }

                val newLesson = CourseLessonModel.create(
                    title = title,
                )

                lessonRepository.save(newLesson)
                    .flatMap { savedLesson ->
                        val updatedSections = latestVersion.sections.map { section ->
                            if (section._id == request.sectionId) {
                                val updatedLessons = section.lessons?.toMutableList() ?: mutableListOf()
                                updatedLessons.add(CourseVersionLessonModel.create(savedLesson._id))
                                section.copy(lessons = updatedLessons)
                            } else {
                                section
                            }
                        }

                        versionService.updateCurrentVersion(
                            courseId = request.courseId,
                            sections = updatedSections,
                            versionId = latestVersion._id,
                            versionName = latestVersion.name,
                            isMajor = false
                        ).then(Mono.just(LessonCreateResponse(savedLesson._id)))
                    }
            } else {
                Mono.error(NoSuchElementException("Секция не найдена"))
            }
        }
    }

    private fun updateVideo(
        request: LessonUpdateVideoRequest,
        updateLesson: (CourseLessonModel) -> CourseLessonModel,
        updateSingleLesson: (CourseVersionLessonModel) -> CourseVersionLessonModel
    ): Mono<LessonCreateResponse> {
        return lessonRepository.findById(request._id)
            .flatMap { existingLesson ->
                versionService.getTargetVersion(request.courseId) { course, version ->
                    val isLessonVisible = lessonVersionService.isLessonVisible(version, request._id)
                    val updatedSections =
                        lessonVersionService.updateSectionsWithLesson(version, request._id, updateSingleLesson)

                    lessonRepository.save(updateLesson(existingLesson))
                        .flatMap { _ ->
                            lessonVersionService.updateVersionWithSections(
                                request.courseId,
                                version,
                                updatedSections,
                                isLessonVisible && course.isPublished == true
                            )
                        }
                }
            }
            .map { LessonCreateResponse(it._id) }
    }

    fun addVideo(request: LessonAddVideoRequest): Mono<LessonCreateResponse> {
        require(request.videoId != null || (request.synopsis == null && request.survey == null)) {
            "synopsis and surveyText require videoId"
        }
        require(request.survey == null || request.synopsis != null) {
            "surveyText requires synopsis"
        }

        return updateVideo(
            request = request,
            updateLesson = { existingLesson ->
                existingLesson.copy(
                    surveyText = request.survey,
                    synopsisText = request.synopsis
                )
            },
            updateSingleLesson = { lessonModel ->
                lessonModel.copy(
                    videoId = request.videoId,
                    hasSynopsis = request.synopsis != null
                )
            }
        )
    }

    fun removeVideo(request: LessonRemoveVideoRequest): Mono<LessonCreateResponse> {
        return updateVideo(
            request = request,
            updateLesson = { existingLesson ->
                existingLesson.copy(
                    surveyText = null,
                    synopsisText = null
                )
            },
            updateSingleLesson = { lessonModel ->
                lessonModel.copy(
                    videoId = null,
                    hasSynopsis = false
                )
            }
        )
    }

    fun addDetails(request: LessonAddDetailsRequest): Mono<LessonCreateResponse> {
        return lessonRepository.findById(request._id)
            .flatMap { existingLesson ->
                if (request.autoDetect) {
                    if (request.time != null || request.timeUnit != null) {
                        return@flatMap Mono.error<CourseLessonModel>(
                            ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Time and timeUnit should be null when autoDetect is true"
                            )
                        )
                    }
                    // TODO: здесь будет логика для autoDetect
                } else {
                    if (request.time == null || request.timeUnit == null) {
                        return@flatMap Mono.error<CourseLessonModel>(
                            ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Time and timeUnit should not be null when autoDetect is false"
                            )
                        )
                    }
                    existingLesson.time = "${request.time} ${request.timeUnit}"
                }

                existingLesson.title = request.title
                if (request.imageUrl != null) {
                    existingLesson.imageUrl = request.imageUrl
                }

                versionService.getTargetVersion(request.courseId).flatMap { version ->
                    val updatedSections =
                        lessonVersionService.updateSectionsWithLesson(version, request._id) { lessonModel ->
                            lessonModel.copy(isDraft = false)
                        }

                    lessonVersionService.updateVersionWithSections(
                        request.courseId,
                        version,
                        updatedSections
                    ).thenReturn(Unit)
                }
            }
            .map { LessonCreateResponse(request._id) }
    }

    fun addSynopsisAndStuff(lesson: LessonAddSynopsisAndStuffRequest): Mono<LessonCreateResponse> {
        return lessonRepository.findById(lesson._id)
            .flatMap { existingLesson ->
                existingLesson.synopsisText = lesson.synopsisText
                // TODO: work with stuff
                lessonRepository.save(existingLesson)
            }
            .map { savedLesson -> LessonCreateResponse(savedLesson._id) }
    }

    fun clearSurveyText(request: LessonAddSurveyRequest, surveyId: String): Mono<Void> {
        return lessonRepository.findById(request._id)
            .flatMap { lesson ->
                val updatedLesson = lesson.copy(surveyText = null)
                lessonRepository.save(updatedLesson)
                    .flatMap { _ ->
                        versionService.getTargetVersion(
                            courseId = request.courseId,
                            versionId = null
                        ) { course, version ->
                            val isLessonVisible = lessonVersionService.isLessonVisible(version, request._id)
                            val updatedSections =
                                lessonVersionService.updateSectionsWithLesson(version, request._id) { lessonModel ->
                                    lessonModel.copy(surveyId = surveyId)
                                }

                            lessonVersionService.updateVersionWithSections(
                                request.courseId,
                                version,
                                updatedSections,
                                isLessonVisible && course.isPublished == true
                            )
                        }
                    }
            }
            .then()
    }

    fun update(
        id: String,
        request: LessonUpdateRequest
    ): Mono<ResponseEntity<CourseLessonModel>> {
        return lessonRepository.findById(id)
            .flatMap { existingLesson ->
                val updatedLesson = existingLesson.copy(
                    title = request.title ?: existingLesson.title,
                    time = request.time ?: existingLesson.time,
                    imageUrl = request.imageUrl ?: existingLesson.imageUrl
                )

                lessonRepository.save(updatedLesson)
                    .flatMap { savedLesson ->
                        if (request.isVisible != null) {
                            versionService.getTargetVersion(request.courseId)
                                .flatMap { version ->
                                    val updatedSections =
                                        lessonVersionService.updateSectionsWithLesson(version, id) { lessonModel ->
                                            lessonModel.copy(isVisible = request.isVisible)
                                        }

                                    lessonVersionService.updateVersionWithSections(
                                        request.courseId,
                                        version,
                                        updatedSections,
                                    ).thenReturn(ResponseEntity.ok(savedLesson))
                                }
                        } else {
                            Mono.just(ResponseEntity.ok(savedLesson))
                        }
                    }
            }
            .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()))
    }

    fun deleteById(
        id: String,
        courseId: String
    ): Mono<ResponseEntity<Void>> {
        return versionService.getTargetVersion(courseId = courseId, versionId = null) { course, version ->
            val isLessonVisible = lessonVersionService.isLessonVisible(version, id)
            val updatedSections = lessonVersionService.updateSectionsWithLesson(version, id) { lessonModel ->
                lessonModel
            }

            lessonVersionService.updateVersionWithSections(
                courseId,
                version,
                updatedSections,
                course.isPublished == true && isLessonVisible
            )
        }
            .then(Mono.just<ResponseEntity<Void>>(ResponseEntity.noContent().build()))
            .onErrorResume { _: Throwable ->
                Mono.just(ResponseEntity.notFound().build())
            }
    }

    fun getForHubById(
        id: String,
        courseId: String
    ): Mono<ResponseEntity<LessonGetHubResponse>> {
        return lessonRepository.findById(id)
            .flatMap { lesson ->
                versionService.getTargetVersion(courseId).flatMap { version ->
                    val result = lessonVersionService.getLessonInVersion(version, id)
                    if (result != null) {
                        val (lessonInVersion, _) = result
                        if (lessonInVersion.surveyId != null) {
                            surveyService.get(lessonInVersion.surveyId)
                                .map { survey ->
                                    lessonMapper.toLessonGetHubResponse(
                                        lesson,
                                        survey,
                                        lessonInVersion.isDraft,
                                        lessonInVersion.videoId
                                    )
                                }
                        } else {
                            Mono.just(
                                lessonMapper.toLessonGetHubResponse(
                                    lesson,
                                    null,
                                    lessonInVersion.isDraft,
                                    lessonInVersion.videoId
                                )
                            )
                        }
                    } else {
                        Mono.error(NoSuchElementException("Лекция не найдена в текущей версии курса"))
                    }
                }
            }
            .map { ResponseEntity.ok(it) }
            .onErrorResume { _: Throwable ->
                Mono.just(ResponseEntity.notFound().build())
            }
    }

    fun getForListById(
        id: String,
        courseId: String
    ): Mono<ResponseEntity<LessonGetListResponse>> {
        return lessonRepository.findById(id)
            .flatMap { lesson ->
                versionService.getTargetVersion(courseId).flatMap { version ->
                    val result = lessonVersionService.getLessonInVersion(version, id)
                    if (result != null) {
                        val (lessonInVersion, sectionId) = result
                        Mono.just(
                            LessonGetListResponse(
                                _id = lesson._id,
                                imageUrl = lesson.imageUrl,
                                synopsisText = lesson.synopsisText,
                                time = lesson.time,
                                title = lesson.title,
                                videoId = lessonInVersion.videoId,
                                sectionId = sectionId
                            )
                        )
                    } else {
                        Mono.error(NoSuchElementException("Лекция не найдена в текущей версии курса"))
                    }
                }
            }
            .map { ResponseEntity.ok(it) }
            .onErrorResume { _: Throwable ->
                Mono.just(ResponseEntity.notFound().build())
            }
    }

}