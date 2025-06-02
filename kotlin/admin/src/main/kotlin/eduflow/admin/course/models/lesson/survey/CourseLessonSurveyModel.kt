package flowledge.admin.course.models.lesson.survey

import flowledge.admin.course.dto.lesson.create.LessonAddSurveyQuestionRequest
import flowledge.admin.utils.generateId
import flowledge.course.lesson.survey.CourseLessonSurvey
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseLessonSurveyModel(
    override val _id: String,
    override val questions: List<CourseLessonSurveyQuestionModel>,
    override val maxAttempts: Int = 1,
    override val passThreshold: Int = 50
) : CourseLessonSurvey {
    companion object {
        fun create(
            maxAttempts: Int? = null,
            passThreshold: Int? = null,
            questions: List<LessonAddSurveyQuestionRequest>
        ): CourseLessonSurveyModel {
            return CourseLessonSurveyModel(
                _id = generateId(),
                maxAttempts = maxAttempts ?: 1,
                passThreshold = passThreshold ?: 50,
                questions = questions.map { question ->
                    CourseLessonSurveyQuestionModel(
                        _id = generateId(),
                        title = question.title,
                        choices = question.choices.map { choice ->
                            CourseLessonSurveyChoiceModel.create(
                                title = choice.title,
                                isCorrect = choice.isCorrect
                            )
                        }
                    )
                }
            )
        }
    }
}