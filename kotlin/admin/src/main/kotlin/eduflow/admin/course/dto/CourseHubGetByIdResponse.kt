package eduflow.admin.course.dto

data class CourseHubGetByIdSmallResponse(
    val _id: String,
    val title: String,
    val description: String,
    val imageUrl: String? = null,
)
