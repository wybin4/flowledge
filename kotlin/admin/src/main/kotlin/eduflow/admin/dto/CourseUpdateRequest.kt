package eduflow.admin.dto

data class CourseUpdateRequest(
    val title: String,
    val description: String,
    val imageUrl: String,
)