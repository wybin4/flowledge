package eduflow.admin.course.dto.lesson.create

data class LessonCreateDraftRequest (
    val courseId: String?,
    val sectionId: String?,
    val videoId: String?,
    val isVisible: Boolean?,
    val synopsis: String?,
    val survey: String?,
): LessonCreateRequest()