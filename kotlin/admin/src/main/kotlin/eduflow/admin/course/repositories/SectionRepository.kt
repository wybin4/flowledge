package eduflow.admin.course.repositories

import eduflow.admin.course.models.CourseSubscriptionModel
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.data.repository.reactive.ReactiveSortingRepository
import org.springframework.stereotype.Repository

@Repository
interface CourseSubscriptionRepository : ReactiveMongoRepository<CourseSubscriptionModel, String>,
    ReactiveSortingRepository<CourseSubscriptionModel, String>