package eduflow.admin.course.repositories

import eduflow.admin.course.models.CourseSubscriptionModel
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.data.repository.reactive.ReactiveSortingRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Repository
interface CourseSubscriptionRepository : ReactiveMongoRepository<CourseSubscriptionModel, String>,
    ReactiveSortingRepository<CourseSubscriptionModel, String> {
    fun findByCourseIdAndUserId(courseId: String, userId: String): Mono<CourseSubscriptionModel>
    fun findByCourseIdInAndUserId(courseIds: List<String>, userId: String): Flux<CourseSubscriptionModel>
}