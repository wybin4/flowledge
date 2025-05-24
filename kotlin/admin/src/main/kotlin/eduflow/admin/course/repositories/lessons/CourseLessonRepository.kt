package eduflow.admin.course.repositories.lessons

import eduflow.admin.course.models.lesson.CourseLessonModel
import org.springframework.data.mongodb.repository.Query
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.data.repository.reactive.ReactiveSortingRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux

@Repository
interface CourseLessonRepository : ReactiveMongoRepository<CourseLessonModel, String>,
    ReactiveSortingRepository<CourseLessonModel, String> {
    @Query("{ '_id': { '\$in': ?0 } }")
    fun findByIdIn(ids: List<String>): Flux<CourseLessonModel>
}