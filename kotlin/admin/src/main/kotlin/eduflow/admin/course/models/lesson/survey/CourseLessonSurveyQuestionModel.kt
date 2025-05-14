package eduflow.admin.course.models.lesson.survey

import eduflow.course.lesson.survey.CourseLessonSurveyQuestion
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseLessonSurveyQuestionModel(
    override val _id: String,
    override val title: String,
    override val choices: List<CourseLessonSurveyChoiceModel>
) : CourseLessonSurveyQuestion