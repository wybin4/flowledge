package eduflow.admin.repositories

import eduflow.admin.models.CourseModel
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.Query
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.data.repository.reactive.ReactiveSortingRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Repository
interface CourseRepository : ReactiveMongoRepository<CourseModel, String>,
    ReactiveSortingRepository<CourseModel, String> {
    fun findByTitleContainingIgnoreCase(value: String, pageable: Pageable): Flux<CourseModel>

    fun countByTitleContainingIgnoreCase(title: String?): Mono<Long>

}