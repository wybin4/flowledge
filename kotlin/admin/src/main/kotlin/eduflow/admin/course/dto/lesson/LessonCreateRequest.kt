package eduflow.admin.course.dto.lesson

data class LessonCreateRequest (
    val title: String,
    val courseId: String?,
    val sectionId: String?,
    val videoId: String?,
    val isVisible: Boolean,
    val imageUrl: String?,
    val time: String
)