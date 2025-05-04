package eduflow.admin.course.dto.lesson.create

data class LessonAddVideoRequest(
    val _id: String,
    val videoId: String?,
    val synopsis: String?,
    val survey: String?,
) : LessonCreateRequest()