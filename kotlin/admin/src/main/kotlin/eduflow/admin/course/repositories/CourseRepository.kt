package eduflow.admin.course.repositories

import eduflow.admin.course.models.CourseModel
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.data.repository.reactive.ReactiveSortingRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Mono

@Repository
interface CourseRepository : ReactiveMongoRepository<CourseModel, String>,
    ReactiveSortingRepository<CourseModel, String>,
    CourseRepositoryTemplate {
    
    fun countByTitleContainingIgnoreCase(title: String?): Mono<Long>
}