package flowledge.admin.course.dto.lesson.create

data class LessonRemoveVideoRequest(
    override val _id: String,
    override val courseId: String,
) : LessonCreateRequest(courseId), LessonUpdateVideoRequest