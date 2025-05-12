package eduflow.admin.course.dto.lesson.create

data class LessonAddSurveyChoiceRequest(
    val _id: String? = null,
    val title: String,
    val isCorrect: Boolean? = null,
)