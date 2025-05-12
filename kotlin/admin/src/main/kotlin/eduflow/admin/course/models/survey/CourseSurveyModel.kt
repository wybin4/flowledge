package eduflow.admin.course.models.survey

import eduflow.course.CourseSurvey
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseSurveyModel(
    override val _id: String,
    override val lessonId: String,
    override val questions: List<CourseSurveyQuestionModel>
) : CourseSurvey