package flowledge.admin.course.dto.course

data class CourseUpdateRequest(
    val title: String,
    val description: String,
    val imageUrl: String,
    val tags: List<String>,
    val isPublished: Boolean
)