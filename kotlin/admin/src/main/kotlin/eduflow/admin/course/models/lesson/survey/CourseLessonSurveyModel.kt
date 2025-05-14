package eduflow.admin.course.models.lesson.survey

import eduflow.course.lesson.survey.CourseLessonSurvey
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseLessonSurveyModel(
    override val _id: String,
    override val lessonId: String,
    override val questions: List<CourseLessonSurveyQuestionModel>
) : CourseLessonSurvey