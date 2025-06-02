package flowledge.admin.course.dto.lesson.create

data class LessonCreateDraftRequest(
    val sectionId: String,
    override val courseId: String,
) : LessonCreateRequest(courseId)