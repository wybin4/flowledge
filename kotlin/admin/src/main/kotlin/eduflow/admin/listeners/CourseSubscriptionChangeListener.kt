package eduflow.admin.listeners

import com.mongodb.client.model.changestream.OperationType
import eduflow.admin.course.models.CourseSubscriptionModel
import eduflow.admin.course.services.CourseService
import eduflow.admin.services.WebSocketNotificationService
import org.springframework.stereotype.Component

@Component
class CourseSubscriptionChangeListener(
    private val webSocketService: WebSocketNotificationService,
    private val courseService: CourseService
) : AbstractMongoChangeStreamListener<CourseSubscriptionModel>() {

    override val entityClass = CourseSubscriptionModel::class.java

    override fun handleChange(action: OperationType?, record: CourseSubscriptionModel) {
        courseService.getCourseBySubscription(record).subscribe { result ->
            val payload = mapOf("action" to action, "record" to result)
            println(payload)
            webSocketService.notifyLoggedInUsers("course-subscriptions-changed", payload)
        }
    }

    override fun getCollectionName(): String {
        return "courseSubscriptionModel"
    }
}
