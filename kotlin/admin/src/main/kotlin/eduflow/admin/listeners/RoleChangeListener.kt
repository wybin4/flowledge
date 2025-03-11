package eduflow.admin.listeners

import com.mongodb.client.model.changestream.OperationType
import eduflow.admin.models.PermissionModel
import eduflow.admin.services.WebSocketNotificationService
import org.springframework.stereotype.Component

@Component
class PermissionChangeListener(
    private val webSocketService: WebSocketNotificationService
) : AbstractMongoChangeStreamListener<PermissionModel>() {
    override val entityClass = PermissionModel::class.java

    override fun handleChange(action: OperationType?, record: PermissionModel) {
        val payload = mapOf("action" to action, "record" to record)
        webSocketService.notifyLoggedInUsers("permissions-changed", payload)
    }

    override fun getCollectionName(): String {
        return "permissionModel"
    }
}
