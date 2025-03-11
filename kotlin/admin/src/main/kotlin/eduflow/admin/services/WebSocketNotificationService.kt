package eduflow.admin.services

import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Service

@Service
class WebSocketNotificationService(
    private val messagingTemplate: SimpMessagingTemplate
) {
    fun notifyAll(topic: String, payload: Any) {
        messagingTemplate.convertAndSend("/topic/$topic", payload)
    }

    fun notifyLoggedInUsers(topic: String, payload: Any) {
        messagingTemplate.convertAndSend("/topic/$topic", payload)
    }

    fun notifyUser(userId: String, topic: String, payload: Any) {
        val destination = "/topic/$userId/$topic"
        messagingTemplate.convertAndSend(destination, payload)
    }

}
