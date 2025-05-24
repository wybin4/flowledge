package eduflow.admin.course.dto.lesson.create

data class LessonAddSurveyRequest(
    override val _id: String,
    val questions: List<LessonAddSurveyQuestionRequest>,
    val passThreshold: Int? = null,
    val maxAttempts: Int? = null,
    override val courseId: String,
) : LessonCreateRequest(courseId), LessonCreateIdentifiableRequest