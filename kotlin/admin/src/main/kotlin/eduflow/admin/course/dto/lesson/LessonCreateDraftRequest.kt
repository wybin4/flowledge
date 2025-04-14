package eduflow.admin.course.dto.lesson

data class LessonCreateDraftRequest (
    val courseId: String?,
    val sectionId: String?,
    val videoId: String?,
    override val isVisible: Boolean?,
    val synopsis: String?,
    val survey: String?,
): LessonCreateRequest