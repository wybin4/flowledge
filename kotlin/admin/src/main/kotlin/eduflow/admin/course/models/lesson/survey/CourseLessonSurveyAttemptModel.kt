package flowledge.admin.course.models.lesson.survey

import flowledge.course.lesson.survey.CourseLessonSurveyAnswer
import flowledge.course.lesson.survey.CourseLessonSurveyAttempt
import org.springframework.data.mongodb.core.mapping.Document
import java.util.*

@Document
data class CourseLessonSurveyAttemptModel(
    override val _id: String,
    override val answers: List<CourseLessonSurveyAnswer>,
    override val completedAt: Date,
    override val score: Int,
    override val surveyId: String,
    override val userId: String,
) : CourseLessonSurveyAttempt