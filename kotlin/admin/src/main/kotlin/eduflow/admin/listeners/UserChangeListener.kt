package eduflow.admin.listeners

import eduflow.admin.models.PrivateSettingModel
import eduflow.admin.services.WebSocketNotificationService
import org.springframework.stereotype.Component

@Component
class PrivateSettingChangeListener(
    private val webSocketService: WebSocketNotificationService
) : AbstractMongoChangeStreamListener<PrivateSettingModel>() {

    override val entityClass = PrivateSettingModel::class.java

    override fun handleChange(change: PrivateSettingModel) {
        if (change.public) {
            webSocketService.notifyAll("public-settings-changed", change)
        }
        webSocketService.notifyLoggedInUsers("private-settings-changed", change)
    }
}
