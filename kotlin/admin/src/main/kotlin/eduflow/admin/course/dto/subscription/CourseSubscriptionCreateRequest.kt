package flowledge.admin.course.dto.subscription

data class CourseSubscriptionCreateRequest(
    val userIds: List<String>,
    val courseId: String,
)