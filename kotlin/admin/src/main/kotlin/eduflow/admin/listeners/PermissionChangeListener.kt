package flowledge.admin.listeners

import com.mongodb.client.model.changestream.OperationType
import flowledge.admin.models.PermissionModel
import flowledge.admin.services.WebSocketNotificationService
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
