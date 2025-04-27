package eduflow.admin.config

import eduflow.admin.interceptors.JwtHandshakeInterceptor
import eduflow.admin.services.TokenService
import org.springframework.context.annotation.Configuration
import org.springframework.messaging.simp.config.MessageBrokerRegistry
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker
import org.springframework.web.socket.config.annotation.StompEndpointRegistry
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer

@Configuration
@EnableWebSocketMessageBroker
class WebSocketConfig(
    private val tokenService: TokenService
) : WebSocketMessageBrokerConfigurer {

    override fun configureMessageBroker(config: MessageBrokerRegistry) {
        config.enableSimpleBroker("/topic")
        config.setApplicationDestinationPrefixes("/app")
    }

    override fun registerStompEndpoints(registry: StompEndpointRegistry) {
        println("Registering WebSocket endpoint...")
        registry.addEndpoint("/websocket")
            .setAllowedOriginPatterns("*")
            .addInterceptors(JwtHandshakeInterceptor(tokenService))
    }

}
