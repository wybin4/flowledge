package flowledge.admin.listeners

import com.mongodb.client.model.changestream.OperationType
import flowledge.admin.models.RoleModel
import flowledge.admin.services.WebSocketNotificationService
import org.springframework.stereotype.Component

@Component
class RoleChangeListener(
    private val webSocketService: WebSocketNotificationService
) : AbstractMongoChangeStreamListener<RoleModel>() {
    override val entityClass = RoleModel::class.java

    override fun handleChange(action: OperationType?, record: RoleModel) {
        val payload = mapOf("action" to action, "record" to record)
        webSocketService.notifyLoggedInUsers("roles-changed", payload)
    }

    override fun getCollectionName(): String {
        return "roleModel"
    }
}
