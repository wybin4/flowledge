package eduflow.admin.course.dto.lesson

data class LessonUpdateRequest(
    val title: String?,
    val time: String?,
    val imageUrl: String?,
    val isVisible: Boolean?,
    val courseId: String
)