package eduflow.admin.course.models.survey

import eduflow.course.CourseSurveyQuestion
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseSurveyQuestionModel(
    override val _id: String,
    override val title: String,
    override val choices: List<CourseSurveyChoiceModel>
) : CourseSurveyQuestion