package eduflow.admin.course.dto.lesson.create

data class LessonAddSurveyQuestionRequest(
    val _id: String? = null,
    val title: String,
    val choices: List<LessonAddSurveyChoiceRequest>
)