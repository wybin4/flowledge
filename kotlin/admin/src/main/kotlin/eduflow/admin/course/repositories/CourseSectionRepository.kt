package eduflow.admin.course.repositories

import eduflow.admin.course.models.CourseSectionModel
import org.springframework.data.mongodb.repository.Query
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.data.repository.reactive.ReactiveSortingRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux

@Repository
interface CourseSectionRepository : ReactiveMongoRepository<CourseSectionModel, String>,
    ReactiveSortingRepository<CourseSectionModel, String> {
    @Query("{ '_id': { '\$in': ?0 } }")
    fun findByIdIn(ids: List<String>): Flux<CourseSectionModel>
}