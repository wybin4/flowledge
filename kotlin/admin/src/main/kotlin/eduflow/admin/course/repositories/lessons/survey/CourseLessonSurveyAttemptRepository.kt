package eduflow.admin.course.repositories.lessons.survey

import eduflow.admin.course.models.lesson.survey.CourseLessonSurveyAttemptModel
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.data.repository.reactive.ReactiveSortingRepository
import org.springframework.stereotype.Repository

@Repository
interface CourseLessonSurveyAttemptRepository : ReactiveMongoRepository<CourseLessonSurveyAttemptModel, String>,
    ReactiveSortingRepository<CourseLessonSurveyAttemptModel, String>