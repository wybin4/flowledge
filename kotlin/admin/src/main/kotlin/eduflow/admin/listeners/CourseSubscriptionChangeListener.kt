package flowledge.admin.listeners

import com.mongodb.client.model.changestream.OperationType
import flowledge.admin.course.models.subscription.CourseSubscriptionModel
import flowledge.admin.course.services.subscription.CourseSubscriptionService
import flowledge.admin.services.WebSocketNotificationService
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
