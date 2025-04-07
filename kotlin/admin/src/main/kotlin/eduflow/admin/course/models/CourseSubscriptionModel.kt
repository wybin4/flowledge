package eduflow.admin.course.models

import eduflow.course.CourseSubscription
import org.springframework.data.mongodb.core.mapping.Document
import java.util.*

@Document
data class CourseSubscriptionModel(
    override val _id: String,
    override val courseId: String,
    override val createdAt: Date,
    override val isFavorite: Boolean?,
    override val roles: List<String>?,
    override val updatedAt: Date,
    override val userId: String,
) : CourseSubscription
