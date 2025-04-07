package eduflow.admin.course.repositories

import eduflow.admin.course.models.CourseLessonModel
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.data.repository.reactive.ReactiveSortingRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux

@Repository
interface CourseLessonRepository : ReactiveMongoRepository<CourseLessonModel, String>,
    ReactiveSortingRepository<CourseLessonModel, String> {
    fun findByCourseId(courseId: String): Flux<CourseLessonModel>

    fun findBySectionId(sectionId: String): Flux<CourseLessonModel>
}