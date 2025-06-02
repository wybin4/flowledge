package flowledge.admin.course.dto.lesson.create

interface LessonUpdateVideoRequest : LessonCreateIdentifiableRequest {
    override val _id: String
    val courseId: String
}