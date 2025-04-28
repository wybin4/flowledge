package eduflow.admin.course.services

import eduflow.admin.course.dto.subscription.CourseSubscriptionGetResponse
import eduflow.admin.course.mappers.CourseSubscriptionMapper
import eduflow.admin.course.models.CourseSubscriptionModel
import eduflow.admin.course.repositories.CourseRepository
import eduflow.admin.course.repositories.CourseSubscriptionRepository
import eduflow.admin.course.types.CourseEditor
import eduflow.admin.repositories.UserRepository
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
class CourseSubscriptionService(
    private val courseRepository: CourseRepository,
    private val subscriptionRepository: CourseSubscriptionRepository,
    private val subscriptionMapper: CourseSubscriptionMapper,
    private val userRepository: UserRepository,
) {
    fun getCoursesWithSubscriptionsByUserId(userId: String): Flux<CourseSubscriptionGetResponse> {
        return subscriptionRepository.findByUserId(userId)
            .flatMap { subscription ->
                courseRepository.findById(subscription.courseId)
                    .map { course ->
                        subscriptionMapper.toSubscriptionWithCourseDto(subscription, course)
                    }
            }
    }

    fun getCourseBySubscription(subscription: CourseSubscriptionModel): Mono<CourseSubscriptionGetResponse> {
        return courseRepository.findById(subscription.courseId)
            .map { course ->
                subscriptionMapper.toSubscriptionWithCourseDto(subscription, course)
            }
    }

    fun getEditorsByCourseId(courseId: String): Flux<CourseEditor> {
        return subscriptionRepository.findUsersWithRolesByCourseId(courseId)
            .collectList()
            .flatMapMany { usersWithCourse ->
                val userIds = usersWithCourse.map { it.userId }
                userRepository.findUsersByIds(userIds)
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