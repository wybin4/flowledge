package flowledge.admin.course.repositories.course.version

import flowledge.admin.course.models.course.version.CourseVersionModel
import org.springframework.data.mongodb.repository.Query
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.data.repository.reactive.ReactiveSortingRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux

@Repository
interface CourseVersionRepository : ReactiveMongoRepository<CourseVersionModel, String>,
    ReactiveSortingRepository<CourseVersionModel, String> {
    @Query("{ '_id': { '\$in': ?0 } }")
    fun findByIdIn(ids: List<String>): Flux<CourseVersionModel>
}