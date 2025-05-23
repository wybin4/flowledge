package eduflow.admin.course.dto.lesson.create

data class LessonCreateDraftRequest(
    val sectionId: String,
    val courseId: String,
) : LessonCreateRequest()