package flowledge.admin.course.dto.section

data class SectionCreateRequest (
    val title: String,
    val courseId: String,
    val isVisible: Boolean
)