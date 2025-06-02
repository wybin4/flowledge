package flowledge.admin.course.dto.subscription

data class CourseSubscriptionGetByCourseIdResponse(
    // sub
    val _id: String,
    val userId: String,
    // course
    val name: String,
    val username: String
)