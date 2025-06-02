package flowledge.admin.course.services.subscription

import flowledge.admin.course.dto.subscription.CourseSubscriptionGetByCourseIdResponse
import flowledge.admin.course.dto.subscription.CourseSubscriptionGetByUserIdResponse
import flowledge.admin.course.mappers.CourseSubscriptionMapper
import flowledge.admin.course.models.subscription.CourseSubscriptionModel
import flowledge.admin.course.repositories.course.CourseRepository
import flowledge.admin.course.repositories.subscription.CourseSubscriptionRepository
import flowledge.admin.course.services.CourseTagService
import flowledge.admin.course.types.CourseEditor
import flowledge.admin.user.repositories.UserRepository
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
class CourseSubscriptionService(
    private val courseRepository: CourseRepository,
    private val tagService: CourseTagService,
    private val subscriptionRepository: CourseSubscriptionRepository,
    private val subscriptionMapper: CourseSubscriptionMapper,
    private val userRepository: UserRepository,
) {
    fun getCoursesWithSubscriptionsByUserId(userId: String): Flux<CourseSubscriptionGetByUserIdResponse> {
        return subscriptionRepository.findByUserId(userId)
            .collectList()
            .flatMapMany { subscriptions ->
                val courseIds = subscriptions.map { it.courseId }
                courseRepository.findByIdIn(courseIds)
                    .collectList()
                    .flatMapMany { courses ->
                        val courseMap = courses.associateBy { it._id }
                        Flux.fromIterable(subscriptions)
                            .flatMap { subscription ->
                                val course = courseMap[subscription.courseId]
                                if (course != null) {
                                    tagService.getUpdatedTagsByCourse(course).map { updatedTags ->
                                        subscriptionMapper.toSubscriptionWithCourseDto(
                                            subscription,
                                            course.updateTags(updatedTags)
                                        )
                                    }
                                } else {
                                    Flux.empty()
                                }
                            }
                    }
            }
    }

    fun getUsersWithSubscriptionsByCourseId(
        courseId: String,
        pageSize: Int
    ): Flux<CourseSubscriptionGetByCourseIdResponse> {
        return subscriptionRepository.findByCourseIdAndIsSubscribed(courseId, true)
            .take(pageSize.toLong())
            .collectList()
            .flatMapMany { subscriptions ->
                val userIds = subscriptions.map { it.userId }
                userRepository.findByIdIn(userIds)
                    .collectList()
                    .flatMapMany { users ->
                        val userMap = users.associateBy { it._id }
                        Flux.fromIterable(subscriptions)
                            .flatMap { subscription ->
                                val user = userMap[subscription.userId]
                                if (user != null) {
                                    Mono.just(subscriptionMapper.toSubscriptionWithUserDto(subscription, user))
                                } else {
                                    Mono.empty()
                                }
                            }
                    }
            }
    }

    fun getCourseBySubscription(
        subscription: CourseSubscriptionModel
    ): Mono<CourseSubscriptionGetByUserIdResponse> {
        return courseRepository.findById(subscription.courseId)
            .flatMap { course ->
                tagService.getUpdatedTagsByCourse(course).map { updatedTags ->
                    subscriptionMapper.toSubscriptionWithCourseDto(
                        subscription, course.updateTags(updatedTags)
                    )
                }
            }
    }

    fun getEditorsByCourseId(courseId: String): Flux<CourseEditor> {
        return subscriptionRepository.findUsersWithRolesByCourseId(courseId)
            .collectList()
            .flatMapMany { usersWithCourse ->
                val userIds = usersWithCourse.map { it.userId }
                userRepository.findByIdIn(userIds)
                    .map { user ->
                        val userWithCourse = usersWithCourse.find { it.userId == user._id }
                        CourseEditor(
                            _id = user._id,
                            name = user.name,
                            username = user.username,
                            roles = userWithCourse?.roles ?: emptyList()
                        )
                    }
            }
    }
}