package flowledge.admin.course.dto.subscription

import flowledge.admin.course.models.CourseCreatorModel
import flowledge.admin.course.models.subscription.progress.CourseProgressModel
import java.util.*

data class CourseSubscriptionGetByUserIdResponse(
    // sub
    val subId: String,
    var isFavourite: Boolean?,
    val isSubscribed: Boolean?,
    val courseVersion: String?,
    val progress: CourseProgressModel?,
    val roles: List<String>?,
    val userId: String,
    // course
    val _id: String,
    val title: String,
    val imageUrl: String? = null,
    val description: String? = null,
    val tags: List<String>? = null,
    val u: CourseCreatorModel,
    val createdAt: Date,
)