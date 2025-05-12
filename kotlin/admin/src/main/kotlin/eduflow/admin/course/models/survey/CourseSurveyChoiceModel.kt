package eduflow.admin.course.models.survey

import eduflow.course.CourseSurveyChoice
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseSurveyChoiceModel(
    override val _id: String,
    override val title: String,
    override val isCorrect: Boolean? = null,
) : CourseSurveyChoice