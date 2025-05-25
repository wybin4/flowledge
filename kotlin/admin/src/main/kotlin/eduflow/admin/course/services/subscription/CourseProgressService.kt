package eduflow.admin.course.services.subscription

import eduflow.admin.course.dto.subscription.progress.CourseProgressTypeRequest
import eduflow.admin.course.dto.subscription.progress.CourseSendProgressRequest
import eduflow.admin.course.dto.subscription.progress.initiate.CourseInitiateProgressRequest
import eduflow.admin.course.models.course.version.CourseVersionLessonModel
import eduflow.admin.course.models.course.version.CourseVersionModel
import eduflow.admin.course.models.subscription.CourseSubscriptionModel
import eduflow.admin.course.models.subscription.progress.CourseProgressLessonModel
import eduflow.admin.course.models.subscription.progress.CourseProgressModel
import eduflow.admin.course.models.subscription.progress.CourseProgressSectionModel
import eduflow.admin.course.repositories.subscription.CourseSubscriptionRepository
import eduflow.admin.course.services.course.CourseVersionService
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class CourseProgressService(
    private val subscriptionRepository: CourseSubscriptionRepository,
    private val versionService: CourseVersionService
) {
    fun initiate(
        request: CourseInitiateProgressRequest,
        userId: String
    ): Mono<CourseSubscriptionModel> {
        val courseId = request.courseId
        val lessonId = request.lessonId
        val type = request.type

        return subscriptionRepository.findByCourseIdAndUserId(courseId, userId)
            .flatMap { existingSubscription ->
                processCourseAndCreateProgress(
                    courseId,
                    null,
                    lessonId,
                    type
                ).flatMap { (sectionProgress, latestVersion) ->
                    val updatedProgress = existingSubscription.progress?.let { progress ->
                        val updatedSections = progress.sections + sectionProgress
                        val totalSections = latestVersion.sections?.size ?: 0
                        val totalProgress = calculateTotalProgress(listOf(sectionProgress), totalSections)
                        progress.copy(
                            sections = updatedSections,
                            progress = totalProgress
                        )
                    } ?: run {
                        val totalSections = latestVersion.sections?.size ?: 0
                        val totalProgress = calculateTotalProgress(listOf(sectionProgress), totalSections)
                        CourseProgressModel(
                            sections = listOf(sectionProgress),
                            progress = totalProgress
                        )
                    }

                    val updatedSubscription = existingSubscription.copy(
                        isSubscribed = true,
                        progress = updatedProgress,
                        courseVersion = existingSubscription.courseVersion ?: latestVersion._id
                    )

                    subscriptionRepository.save(updatedSubscription)
                }
            }
            .switchIfEmpty(
                processCourseAndCreateProgress(
                    courseId,
                    null,
                    lessonId,
                    type
                ).flatMap { (sectionProgress, latestVersion) ->
                    val totalSections = latestVersion.sections?.size ?: 0
                    val totalProgress = calculateTotalProgress(listOf(sectionProgress), totalSections)
                    CourseSubscriptionModel.create(
                        userId = userId,
                        courseId = courseId,
                        isSubscribed = true,
                        isFavourite = false,
                        roles = null,
                        courseVersion = latestVersion._id,
                        progress = CourseProgressModel(
                            sections = listOf(sectionProgress),
                            progress = totalProgress
                        )
                    ).let { subscriptionRepository.save(it) }
                }
            )
    }

    fun send(request: CourseSendProgressRequest): Mono<CourseSubscriptionModel> {
        val subscriptionId = request.subscriptionId
        val lessonId = request.lessonId
        val type = request.type
        val progress = request.progress

        return subscriptionRepository.findById(subscriptionId)
            .flatMap { existingSubscription ->
                processCourseAndCreateProgress(
                    existingSubscription.courseId,
                    existingSubscription.courseVersion,
                    lessonId,
                    type
                ).flatMap { (sectionProgress, latestVersion) ->
                    val updatedProgress = existingSubscription.progress?.let { progressModel ->
                        val updatedSections = progressModel.sections.map { section ->
                            val updatedLessons = section.lessons.map { lesson ->
                                if (lesson._id == lessonId) {
                                    val versionLesson = latestVersion.sections
                                        ?.flatMap { it.lessons ?: emptyList() }
                                        ?.find { it._id == lessonId }
                                        ?: throw NoSuchElementException("Урок не найден в версии курса")

                                    val updatedLessonProgress = when (type) {
                                        CourseProgressTypeRequest.VIDEO -> lesson.copy(videoProgress = progress)
                                        CourseProgressTypeRequest.SYNOPSIS -> lesson.copy(synopsisProgress = progress)
                                        CourseProgressTypeRequest.SURVEY -> lesson.copy(isSurveyPassed = progress == 100.0)
                                        else -> lesson
                                    }

                                    val totalProgress =
                                        calculateLessonTotalProgress(updatedLessonProgress, versionLesson)
                                    updatedLessonProgress.copy(progress = totalProgress)
                                } else {
                                    lesson
                                }
                            }

                            val versionSection = latestVersion.sections
                                ?.find { it._id == section._id }
                                ?: throw NoSuchElementException("Секция не найдена в версии курса")

                            val totalLessons =
                                versionSection.lessons?.size ?: 0

                            val updatedSectionProgress = updatedLessons.sumOf { it.progress } / totalLessons
                            section.copy(
                                lessons = updatedLessons,
                                progress = updatedSectionProgress
                            )
                        }

                        val totalSections = latestVersion.sections?.size ?: 0
                        val totalProgress = calculateTotalProgress(updatedSections, totalSections)
                        progressModel.copy(
                            sections = updatedSections,
                            progress = totalProgress
                        )
                    } ?: run {
                        val totalSections = latestVersion.sections?.size ?: 0
                        val totalProgress = calculateTotalProgress(listOf(sectionProgress), totalSections)
                        CourseProgressModel(
                            sections = listOf(sectionProgress),
                            progress = totalProgress
                        )
                    }

                    val updatedSubscription = existingSubscription.copy(
                        isSubscribed = true,
                        progress = updatedProgress,
                        courseVersion = existingSubscription.courseVersion ?: latestVersion._id
                    )

                    subscriptionRepository.save(updatedSubscription)
                }
            }
            .switchIfEmpty(
                Mono.error(IllegalStateException("Subscription not found with id $subscriptionId"))
            )
    }

    private fun processCourseAndCreateProgress(
        courseId: String,
        versionId: String?,
        lessonId: String,
        type: CourseProgressTypeRequest
    ): Mono<Pair<CourseProgressSectionModel, CourseVersionModel>> {
        return versionService.getTargetVersion(courseId, versionId)
            .flatMap { latestVersion ->
                val (section, lesson) = latestVersion.sections
                    ?.asSequence()
                    ?.mapNotNull { section ->
                        section.lessons
                            ?.find { it._id == lessonId }
                            ?.let { lesson -> section to lesson }
                    }
                    ?.firstOrNull()
                    ?: return@flatMap Mono.error(NoSuchElementException("Секция или урок не найдены"))

                val sectionId = section._id
                val totalLessons = section.lessons?.size ?: 0

                val totalItems = calculateTotalItems(lesson)
                val lessonProgress = createLessonProgress(lessonId, type, totalItems)
                val sectionProgress = createSectionProgress(sectionId, totalLessons, lessonProgress)
                Mono.just(sectionProgress to latestVersion)
            }
    }

    private fun calculateTotalItems(lesson: CourseVersionLessonModel): Int {
        return listOfNotNull(
            lesson.videoId,
            lesson.hasSynopsis,
            lesson.surveyId
        ).size
    }

    private fun createLessonProgress(
        lessonId: String,
        type: CourseProgressTypeRequest,
        totalItems: Int
    ): CourseProgressLessonModel {
        val progress = if (totalItems > 0) (1.0 / (totalItems * 100) * 100) else 0.0

        return when (type) {
            CourseProgressTypeRequest.VIDEO -> CourseProgressLessonModel(
                _id = lessonId,
                progress = progress,
                isSurveyPassed = null,
                synopsisProgress = null,
                videoProgress = 1.0
            )

            CourseProgressTypeRequest.SYNOPSIS -> CourseProgressLessonModel(
                _id = lessonId,
                progress = progress,
                isSurveyPassed = null,
                synopsisProgress = 1.0,
                videoProgress = null
            )

            else -> CourseProgressLessonModel(
                _id = lessonId,
                progress = progress,
                isSurveyPassed = null,
                synopsisProgress = null,
                videoProgress = null
            )
        }
    }

    private fun calculateLessonTotalProgress(
        lesson: CourseProgressLessonModel,
        versionLesson: CourseVersionLessonModel
    ): Double {
        val totalItems = calculateTotalItems(versionLesson)
        if (totalItems == 0) return 0.0

        val totalProgress = listOfNotNull(
            lesson.videoProgress,
            lesson.synopsisProgress,
            if (lesson.isSurveyPassed == true) 100.0 else null
        ).sum()

        return totalProgress / totalItems
    }

    private fun createSectionProgress(
        sectionId: String,
        totalLessons: Int,
        lessonProgress: CourseProgressLessonModel
    ): CourseProgressSectionModel {
        return if (totalLessons > 0) {
            val progress = lessonProgress.progress / totalLessons
            CourseProgressSectionModel(
                _id = sectionId,
                lessons = listOf(lessonProgress),
                progress = progress
            )
        } else {
            CourseProgressSectionModel(
                _id = sectionId,
                lessons = listOf(lessonProgress),
                progress = 0.0
            )
        }
    }

    private fun calculateTotalProgress(sections: List<CourseProgressSectionModel>, totalSections: Int): Double {
        if (sections.isEmpty() || totalSections == 0) return 0.0
        val totalProgress = sections.sumOf { it.progress } / totalSections
        return totalProgress
    }
}