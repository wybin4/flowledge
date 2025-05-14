package eduflow.admin.course.models.lesson.survey

import eduflow.course.lesson.survey.CourseLessonSurveyChoice
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseLessonSurveyChoiceModel(
    override val _id: String,
    override val title: String,
    override val isCorrect: Boolean? = null,
) : CourseLessonSurveyChoice