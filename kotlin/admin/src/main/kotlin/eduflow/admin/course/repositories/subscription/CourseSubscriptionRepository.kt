package flowledge.admin.course.repositories.subscription

import flowledge.admin.course.models.subscription.CourseSubscriptionModel
import flowledge.admin.types.UserWithCourseRole
import org.springframework.data.mongodb.repository.Query
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.data.repository.reactive.ReactiveSortingRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Repository
interface CourseSubscriptionRepository :
    ReactiveMongoRepository<CourseSubscriptionModel, String>,
    ReactiveSortingRepository<CourseSubscriptionModel, String>,
    CourseSubscriptionRepositoryTemplate {
    fun findByCourseIdAndUserId(courseId: String, userId: String): Mono<CourseSubscriptionModel>

    @Query(
        value = "{ 'courseId': ?0, 'roles': { \$exists: true, \$not: { \$size: 0 } } }",
        fields = "{ 'userId': 1, 'roles': 1 }"
    )
    fun findUsersWithRolesByCourseId(courseId: String): Flux<UserWithCourseRole>

    fun findByUserId(userId: String): Flux<CourseSubscriptionModel>

    fun findByCourseIdAndIsSubscribed(courseId: String, isSubscribed: Boolean): Flux<CourseSubscriptionModel>

    fun countByCourseIdAndIsSubscribed(courseId: String, isSubscribed: Boolean): Mono<Long>
}