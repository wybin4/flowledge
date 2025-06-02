package flowledge.admin.course.dto.lesson.create

data class LessonAddVideoRequest(
    override val _id: String,
    val videoId: String?,
    val synopsis: String?,
    val survey: String?,
    override val courseId: String,
) : LessonCreateRequest(courseId), LessonUpdateVideoRequest