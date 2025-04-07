package eduflow.admin.course.repositories

import eduflow.admin.course.models.CourseSectionModel
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.data.repository.reactive.ReactiveSortingRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux

@Repository
interface CourseSectionRepository : ReactiveMongoRepository<CourseSectionModel, String>,
    ReactiveSortingRepository<CourseSectionModel, String> {
    fun findByCourseId(courseId: String): Flux<CourseSectionModel>
}