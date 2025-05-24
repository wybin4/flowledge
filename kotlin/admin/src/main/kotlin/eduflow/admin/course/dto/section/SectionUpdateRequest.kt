package eduflow.admin.course.dto.section

data class SectionUpdateRequest(
    val title: String? = null,
    val isVisible: Boolean? = null,
    val courseId: String
)