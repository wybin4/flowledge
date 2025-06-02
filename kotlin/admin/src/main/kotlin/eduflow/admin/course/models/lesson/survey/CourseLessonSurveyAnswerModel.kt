package flowledge.admin.course.models.lesson.survey

import flowledge.course.lesson.survey.CourseLessonSurveyAnswer
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseLessonSurveyAnswerModel(
    override val correctChoiceId: String,
    override val userChoiceId: String
) : CourseLessonSurveyAnswer