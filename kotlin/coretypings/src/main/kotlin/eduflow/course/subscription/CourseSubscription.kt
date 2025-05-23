package eduflow.course.subscription

import eduflow.course.subscription.progress.CourseProgress
import java.util.*

interface CourseSubscription {
    val _id: String
    val userId: String
    val courseId: String

    val isFavourite: Boolean?
    val isSubscribed: Boolean?
    val roles: List<String>?
    val createdAt: Date
    val updatedAt: Date

    val courseVersion: String?
    val progress: CourseProgress?
}