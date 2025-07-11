package flowledge.admin.course.models.lesson.survey

import flowledge.admin.course.dto.lesson.create.LessonAddSurveyChoiceRequest
import flowledge.admin.utils.generateId
import flowledge.course.lesson.survey.CourseLessonSurveyQuestion
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseLessonSurveyQuestionModel(
    override val _id: String,
    override val title: String,
    override val choices: List<CourseLessonSurveyChoiceModel>
) : CourseLessonSurveyQuestion {
    companion object {
        fun create(
            _id: String?,
            title: String,
            choices: List<LessonAddSurveyChoiceRequest>
        ): CourseLessonSurveyQuestionModel {
            return CourseLessonSurveyQuestionModel(
                _id = _id ?: generateId(),
                title = title,
                choices = choices.map { choice ->
                    CourseLessonSurveyChoiceModel.create(
                        _id = choice._id,
                        title = choice.title,
                        isCorrect = choice.isCorrect
                    )
                }
            )
        }
    }
}