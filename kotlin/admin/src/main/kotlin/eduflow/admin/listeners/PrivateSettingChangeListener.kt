package flowledge.admin.listeners

import com.mongodb.client.model.changestream.OperationType
import flowledge.admin.models.PrivateSettingModel
import flowledge.admin.services.WebSocketNotificationService
import org.springframework.stereotype.Component

@Component
class PrivateSettingChangeListener(
    private val webSocketService: WebSocketNotificationService
) : AbstractMongoChangeStreamListener<PrivateSettingModel>() {

    override val entityClass = PrivateSettingModel::class.java

    override fun handleChange(action: OperationType?, record: PrivateSettingModel) {
        val payload = mapOf("action" to action, "record" to record)
        if (record.public) {
            webSocketService.notifyAll("public-settings-changed", payload)
        }
        webSocketService.notifyLoggedInUsers("private-settings-changed", payload)
    }

    override fun getCollectionName(): String {
        return "privateSettingModel"
    }
}
