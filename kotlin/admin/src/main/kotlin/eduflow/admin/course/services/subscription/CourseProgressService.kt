package eduflow.admin.course.services.subscription

import eduflow.admin.course.dto.subscription.progress.CourseInitiateProgressRequest
import eduflow.admin.course.dto.subscription.progress.CourseProgressTypeRequest
import eduflow.admin.course.dto.subscription.progress.CourseSendProgressRequest
import eduflow.admin.course.models.course.CourseVersionModel
import eduflow.admin.course.models.lesson.CourseLessonModel
import eduflow.admin.course.models.subscription.CourseSubscriptionModel
import eduflow.admin.course.models.subscription.progress.CourseProgressLessonModel
import eduflow.admin.course.models.subscription.progress.CourseProgressModel
import eduflow.admin.course.models.subscription.progress.CourseProgressSectionModel
import eduflow.admin.course.repositories.course.CourseRepository
import eduflow.admin.course.repositories.lessons.CourseLessonRepository
import eduflow.admin.course.repositories.subscription.CourseSubscriptionRepository
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class CourseProgressService(
    private val courseRepository: CourseRepository,
    private val subscriptionRepository: CourseSubscriptionRepository,
    private val lessonRepository: CourseLessonRepository,
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
                processCourseAndCreateProgress(courseId, lessonId, type).flatMap { (sectionProgress, latestVersion) ->
                    val updatedProgress = existingSubscription.progress?.let { progress ->
                        val updatedSections = progress.sections + sectionProgress
                        val totalProgress = calculateTotalProgress(updatedSections)
                        progress.copy(
                            sections = updatedSections,
                            progress = totalProgress
                        )
                    } ?: run {
                        val totalProgress = calculateTotalProgress(listOf(sectionProgress))
                        CourseProgressModel(
                            sections = listOf(sectionProgress),
                            progress = totalProgress
                        )
                    }

                    val updatedSubscription = existingSubscription.copy(
                        isSubscribed = true,
                        progress = updatedProgress,
                        courseVersion = existingSubscription.courseVersion ?: latestVersion.name
                    )

                    subscriptionRepository.save(updatedSubscription)
                }
            }
            .switchIfEmpty(
                processCourseAndCreateProgress(courseId, lessonId, type).flatMap { (sectionProgress, latestVersion) ->
                    val totalProgress = calculateTotalProgress(listOf(sectionProgress))
                    CourseSubscriptionModel.create(
                        userId = userId,
                        courseId = courseId,
                        isSubscribed = true,
                        isFavourite = false,
                        roles = null,
                        courseVersion = latestVersion.name,
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
                    lessonId,
                    type
                ).flatMap { (sectionProgress, latestVersion) ->
                    val updatedProgress = existingSubscription.progress?.let { progressModel ->
                        val updatedSections = progressModel.sections.map { section ->
                            val updatedLessons = section.lessons.map { lesson ->
                                if (lesson._id == lessonId) {
                                    val updatedLessonProgress = when (type) {
                                        CourseProgressTypeRequest.VIDEO -> lesson.copy(videoProgress = progress)
                                        CourseProgressTypeRequest.SYNOPSIS -> lesson.copy(synopsisProgress = progress)
                                        CourseProgressTypeRequest.SURVEY -> lesson.copy(isSurveyPassed = progress == 100.0)
                                        else -> lesson
                                    }

                                    val totalProgress = calculateLessonTotalProgress(updatedLessonProgress)
                                    updatedLessonProgress.copy(progress = totalProgress)
                                } else {
                                    lesson
                                }
                            }

                            val updatedSectionProgress = updatedLessons.map { it.progress }.average()
                            section.copy(
                                lessons = updatedLessons,
                                progress = updatedSectionProgress
                            )
                        }

                        val totalProgress = calculateTotalProgress(updatedSections)
                        progressModel.copy(
                            sections = updatedSections,
                            progress = totalProgress
                        )
                    } ?: run {
                        val totalProgress = calculateTotalProgress(listOf(sectionProgress))
                        CourseProgressModel(
                            sections = listOf(sectionProgress),
                            progress = totalProgress
                        )
                    }

                    val updatedSubscription = existingSubscription.copy(
                        isSubscribed = true,
                        progress = updatedProgress,
                        courseVersion = existingSubscription.courseVersion ?: latestVersion.name
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
        lessonId: String,
        type: CourseProgressTypeRequest
    ): Mono<Pair<CourseProgressSectionModel, CourseVersionModel>> {
        return courseRepository.findById(courseId)
            .flatMap { course ->
                val latestVersion = course.getLatestVersion()
                    ?: return@flatMap Mono.error(NoSuchElementException("Версия курса не найдена"))

                val section = latestVersion.sections
                    ?.find { section -> section.lessons?.contains(lessonId) == true }
                    ?: return@flatMap Mono.error(NoSuchElementException("Секция с уроком не найдена"))

                val sectionId = section._id
                val totalLessons = section.lessons?.size ?: 0

                lessonRepository.findById(lessonId)
                    .map { lesson ->
                        val totalItems = calculateTotalItems(lesson)
                        val lessonProgress = createLessonProgress(lessonId, type, totalItems)
                        val sectionProgress = createSectionProgress(sectionId, totalLessons, lessonProgress)
                        sectionProgress to latestVersion
                    }
            }
    }

    private fun calculateTotalItems(lesson: CourseLessonModel): Int {
        return listOfNotNull(
            lesson.videoId,
            lesson.synopsisText,
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

    private fun calculateLessonTotalProgress(lesson: CourseProgressLessonModel): Double {
        val totalItems = listOfNotNull(
            lesson.videoProgress,
            lesson.synopsisProgress,
            if (lesson.isSurveyPassed == true) 100.0 else null
        ).size

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

    private fun calculateTotalProgress(sections: List<CourseProgressSectionModel>): Double {
        if (sections.isEmpty()) return 0.0
        return sections.map { it.progress }.average()
    }
}