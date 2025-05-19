package eduflow.admin.course.dto.lesson.create

data class LessonAddSurveyRequest(
    val _id: String,
    val questions: List<LessonAddSurveyQuestionRequest>,
    val passThreshold: Int? = null,
    val maxAttempts: Int? = null
) : LessonCreateRequest()