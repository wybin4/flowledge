package flowledge.admin.course.repositories.lessons.survey

import flowledge.admin.course.models.lesson.survey.CourseLessonSurveyModel
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.data.repository.reactive.ReactiveSortingRepository
import org.springframework.stereotype.Repository

@Repository
interface CourseLessonSurveyRepository : ReactiveMongoRepository<CourseLessonSurveyModel, String>,
    ReactiveSortingRepository<CourseLessonSurveyModel, String>