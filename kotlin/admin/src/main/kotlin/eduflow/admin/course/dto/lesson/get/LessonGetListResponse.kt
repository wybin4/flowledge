package eduflow.admin.course.dto.lesson.get

data class LessonGetListResponse(
    val _id: String,
    val imageUrl: String?,
    val synopsisText: String?,
    val time: String?,
    val title: String,
    val videoId: String?,
    val sectionId: String
)
