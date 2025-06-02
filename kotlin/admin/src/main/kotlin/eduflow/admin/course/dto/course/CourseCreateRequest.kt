package flowledge.admin.course.dto.course

data class CourseCreateRequest(
    val title: String,
    val description: String,
    val imageUrl: String? = null
)