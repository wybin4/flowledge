package eduflow.admin.course.models

import eduflow.course.CourseSubscription
import org.springframework.data.mongodb.core.mapping.Document
import java.util.*

@Document
data class CourseSubscriptionModel(
    override val _id: String,
    override val courseId: String,
    override val createdAt: Date,
    override var isFavourite: Boolean?,
    override var isSubscribed: Boolean?,
    override val roles: List<String>?,
    override val updatedAt: Date,
    override val userId: String,
) : CourseSubscription {
    companion object {
        fun create(
            userId: String,
            courseId: String,
            isSubscribed: Boolean = true,
            isFavourite: Boolean = false,
            roles: List<String>? = null
        ): CourseSubscriptionModel {
            return CourseSubscriptionModel(
                _id = UUID.randomUUID().toString(),
                userId = userId,
                courseId = courseId,
                isSubscribed = isSubscribed,
                isFavourite = isFavourite,
                roles = roles,
                createdAt = Date(),
                updatedAt = Date()
            )
        }
    }
}
