package eduflow.admin.course.models.lesson.survey

import eduflow.course.lesson.survey.CourseLessonSurveyAnswer
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseLessonSurveyAnswerModel(
    override val correctChoiceId: String,
    override val userChoiceId: String
) : CourseLessonSurveyAnswer