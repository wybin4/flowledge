package eduflow.admin.interceptors

import eduflow.admin.services.TokenService
import org.springframework.http.server.ServerHttpRequest
import org.springframework.http.server.ServerHttpResponse
import org.springframework.web.socket.WebSocketHandler
import org.springframework.web.socket.server.HandshakeInterceptor

class JwtHandshakeInterceptor(
    private val tokenService: TokenService
) : HandshakeInterceptor {

    override fun beforeHandshake(
        request: ServerHttpRequest,
        response: ServerHttpResponse,
        wsHandler: WebSocketHandler,
        attributes: MutableMap<String, Any>
    ): Boolean {
        val cookies = request.headers["Cookie"]?.firstOrNull()
        val token = cookies?.split(";")?.find { it.trim().startsWith("jwtToken=") }?.substringAfter("=")

        if (token != null) {
            val userId = tokenService.validateToken(token)
            if (userId != null) {
                attributes["userId"] = userId
                return true
            }
        }

        return false
    }

    override fun afterHandshake(
        request: ServerHttpRequest, response: ServerHttpResponse, wsHandler: WebSocketHandler, exception: Exception?
    ) {
        //
    }
}
