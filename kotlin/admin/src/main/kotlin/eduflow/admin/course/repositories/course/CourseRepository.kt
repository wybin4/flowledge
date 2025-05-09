package eduflow.admin.course.repositories.course

import eduflow.admin.course.models.CourseModel
import org.springframework.data.mongodb.repository.Query
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.data.repository.reactive.ReactiveSortingRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Repository
interface CourseRepository :
    ReactiveMongoRepository<CourseModel, String>,
    ReactiveSortingRepository<CourseModel, String>,
    CourseRepositoryTemplate {
    fun countByTitleContainingIgnoreCase(title: String?): Mono<Long>

    @Query("{ '_id': { '\$in': ?0 } }")
    fun findByIdIn(ids: List<String>): Flux<CourseModel>
}