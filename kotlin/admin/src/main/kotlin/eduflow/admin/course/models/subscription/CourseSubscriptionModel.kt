package eduflow.admin.course.models.subscription

import eduflow.admin.course.models.subscription.progress.CourseProgressModel
import eduflow.admin.utils.generateId
import eduflow.course.subscription.CourseSubscription
import org.springframework.data.mongodb.core.mapping.Document
import java.util.*

@Document
data class CourseSubscriptionModel(
    override val _id: String,
    override val userId: String,
    override val courseId: String,

    override var isFavourite: Boolean?,
    override var isSubscribed: Boolean?,
    override val roles: List<String>?,

    override val createdAt: Date,
    override val updatedAt: Date,

    override val courseVersion: String? = null,
    override val progress: CourseProgressModel? = null,
) : CourseSubscription {
    fun getIsFavourite(): Boolean? = isFavourite
    fun getIsSubscribed(): Boolean? = isSubscribed

    companion object {
        fun create(
            userId: String,
            courseId: String,
            isSubscribed: Boolean = false,
            isFavourite: Boolean = false,
            roles: List<String>? = null,
            courseVersion: String? = null,
            progress: CourseProgressModel? = null,
        ): CourseSubscriptionModel {
            return CourseSubscriptionModel(
                _id = generateId(),
                userId = userId,
                courseId = courseId,
                isSubscribed = isSubscribed,
                isFavourite = isFavourite,
                roles = roles,
                createdAt = Date(),
                updatedAt = Date(),
                courseVersion = courseVersion,
                progress = progress,
            )
        }
    }

}
