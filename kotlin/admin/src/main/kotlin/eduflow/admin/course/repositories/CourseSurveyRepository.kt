package eduflow.admin.course.repositories

import eduflow.admin.course.models.survey.CourseSurveyModel
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.data.repository.reactive.ReactiveSortingRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Mono

@Repository
interface CourseSurveyRepository : ReactiveMongoRepository<CourseSurveyModel, String>,
    ReactiveSortingRepository<CourseSurveyModel, String> {
    fun findByLessonId(lessonId: String): Mono<CourseSurveyModel>
}