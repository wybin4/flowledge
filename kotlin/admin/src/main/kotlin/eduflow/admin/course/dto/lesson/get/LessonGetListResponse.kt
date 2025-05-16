package eduflow.admin.course.dto.lesson.get

data class LessonGetListResponse(
    val _id: String,
    val courseId: String?,
    val courseName: String? = null,
    val imageUrl: String?,
    val sectionId: String?,
    val synopsisText: String?,
    val time: String?,
    val title: String,
    val videoId: String?
)
