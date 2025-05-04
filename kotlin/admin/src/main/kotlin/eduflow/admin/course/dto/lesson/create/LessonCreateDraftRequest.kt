package eduflow.admin.course.dto.lesson.create

data class LessonCreateDraftRequest(
    val courseId: String?,
    val sectionId: String?,
) : LessonCreateRequest()