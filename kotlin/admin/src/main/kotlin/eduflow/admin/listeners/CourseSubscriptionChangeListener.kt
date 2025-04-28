package eduflow.admin.listeners

import com.mongodb.client.model.changestream.OperationType
import eduflow.admin.course.models.CourseSubscriptionModel
import eduflow.admin.course.services.CourseSubscriptionService
import eduflow.admin.services.WebSocketNotificationService
import org.springframework.stereotype.Component

@Component
class CourseSubscriptionChangeListener(
    private val webSocketService: WebSocketNotificationService,
    private val subscriptionService: CourseSubscriptionService
) : AbstractMongoChangeStreamListener<CourseSubscriptionModel>() {

    override val entityClass = CourseSubscriptionModel::class.java

    override fun handleChange(action: OperationType?, record: CourseSubscriptionModel) {
        subscriptionService.getCourseBySubscription(record).subscribe { result ->
            val payload = mapOf("action" to action, "record" to result)
            webSocketService.notifyLoggedInUsers("course-subscriptions-changed", payload)
        }
    }

    override fun getCollectionName(): String {
        return "courseSubscriptionModel"
    }
}
