package flowledge.admin.course.models.lesson.survey

import flowledge.admin.utils.generateId
import flowledge.course.lesson.survey.CourseLessonSurveyChoice
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseLessonSurveyChoiceModel(
    override val _id: String,
    override val title: String,
    override val isCorrect: Boolean? = null,
) : CourseLessonSurveyChoice {
    companion object {
        fun create(
            _id: String? = null,
            title: String,
            isCorrect: Boolean? = null,
        ): CourseLessonSurveyChoiceModel {
            return CourseLessonSurveyChoiceModel(
                _id = _id ?: generateId(),
                title = title,
                isCorrect = isCorrect
            )
        }
    }
}