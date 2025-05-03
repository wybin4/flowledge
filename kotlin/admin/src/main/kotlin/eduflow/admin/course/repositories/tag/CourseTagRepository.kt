package eduflow.admin.course.repositories.tag

import eduflow.admin.course.models.CourseTagModel
import org.springframework.data.mongodb.repository.Query
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.data.repository.reactive.ReactiveSortingRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Repository
interface CourseTagRepository :
    ReactiveMongoRepository<CourseTagModel, String>,
    ReactiveSortingRepository<CourseTagModel, String>,
    CourseTagRepositoryTemplate {
    @Query("{ '_id': { '\$in': ?0 } }")
    fun findByIdIn(ids: List<String>): Flux<CourseTagModel>

    fun countByNameContainingIgnoreCase(name: String?): Mono<Long>

    fun findByName(name: String): Flux<CourseTagModel>

    fun findByNameIn(names: List<String>): Flux<CourseTagModel>
}