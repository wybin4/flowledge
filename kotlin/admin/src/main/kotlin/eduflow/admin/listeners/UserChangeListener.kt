package eduflow.admin.listeners

import com.mongodb.client.model.changestream.OperationType
import eduflow.admin.models.UserModel
import eduflow.admin.services.WebSocketNotificationService
import org.springframework.stereotype.Component

@Component
class UserChangeListener(
    private val webSocketService: WebSocketNotificationService
) : AbstractMongoChangeStreamListener<UserModel>() {

    override val entityClass = UserModel::class.java

    override fun handleChange(action: OperationType?, record: UserModel) {
        val payload = mapOf("action" to action, "record" to record)
        webSocketService.notifyUser(record._id,"user-changed", payload)
    }

    override fun getCollectionName(): String {
        return "userModel"
    }
}
