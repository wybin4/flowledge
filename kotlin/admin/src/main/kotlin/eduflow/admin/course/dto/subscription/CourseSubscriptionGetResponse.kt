package eduflow.admin.course.dto.subscription

data class CourseSubscriptionGetResponse(
    // sub
    val _id: String,
    val courseId: String,
    var isFavourite: Boolean?,
    val isSubscribed: Boolean?,
    val roles: List<String>?,
    val userId: String,
    // course
    val title: String,
    val imageUrl: String? = null,
    val description: String? = null,
    val tags: List<String>? = null,
)