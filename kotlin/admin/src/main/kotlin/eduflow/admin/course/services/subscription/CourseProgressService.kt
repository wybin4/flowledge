package eduflow.admin.course.services.subscription

import eduflow.admin.course.dto.subscription.progress.CourseInitiateProgressRequest
import eduflow.admin.course.dto.subscription.progress.CourseInitiateProgressTypeRequest
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
                        progress.copy(
                            sections = progress.sections + sectionProgress
                        )
                    } ?: run {
                        CourseProgressModel(sections = listOf(sectionProgress))
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
                    CourseSubscriptionModel.create(
                        userId = userId,
                        courseId = courseId,
                        isSubscribed = true,
                        isFavourite = false,
                        roles = null,
                        courseVersion = latestVersion.name,
                        progress = CourseProgressModel(sections = listOf(sectionProgress))
                    ).let { subscriptionRepository.save(it) }
                }
            )
    }

    private fun processCourseAndCreateProgress(
        courseId: String,
        lessonId: String,
        type: CourseInitiateProgressTypeRequest
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
        type: CourseInitiateProgressTypeRequest,
        totalItems: Int
    ): CourseProgressLessonModel {
        val progress = if (totalItems > 0) (1.0 / (totalItems * 100) * 100) else 0.0

        return when (type) {
            CourseInitiateProgressTypeRequest.VIDEO -> CourseProgressLessonModel(
                _id = lessonId,
                progress = progress,
                isSurveyPassed = null,
                synopsisProgress = null,
                videoProgress = 1
            )

            CourseInitiateProgressTypeRequest.SYNOPSIS -> CourseProgressLessonModel(
                _id = lessonId,
                progress = progress,
                isSurveyPassed = null,
                synopsisProgress = 1,
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
}