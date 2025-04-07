package eduflow.course

import java.util.Date

interface CourseSubscription {
    val _id: String
    val userId: String
    val courseId: String
    val isFavorite: Boolean?
    val roles: List<String>?
    val createdAt: Date
    val updatedAt: Date
}