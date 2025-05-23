package eduflow.admin.course.repositories

import eduflow.admin.course.models.subscription.progress.CourseProgressModel
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.data.repository.reactive.ReactiveSortingRepository
import org.springframework.stereotype.Repository

@Repository
interface CourseProgressRepository : ReactiveMongoRepository<CourseProgressModel, String>,
    ReactiveSortingRepository<CourseProgressModel, String>