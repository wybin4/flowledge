package eduflow.admin.filters

import eduflow.admin.services.TokenService
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.filter.OncePerRequestFilter

class JwtTokenFilter(
    private val tokenService: TokenService,
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        if (request.requestURI.contains("/websocket")) {
            filterChain.doFilter(request, response)
            return
        }

        val cookies = request.cookies
        val token = cookies?.find { it.name == "jwtToken" }?.value

        print(request.requestURI)
        println(token)

        if (token != null) {
            val userId = tokenService.validateToken(token)
            if (userId != null) {
                val user = tokenService.userRepository.findById(userId).block()

                if (user != null && user.services?.resume?.jwtToken == token) {
                    val authentication = UsernamePasswordAuthenticationToken(user, null, emptyList())
                    SecurityContextHolder.getContext().authentication = authentication
                } else {
                    response.status = HttpServletResponse.SC_UNAUTHORIZED
                    response.writer.println("Invalid token")
                    return
                }
            } else {
                response.status = HttpServletResponse.SC_UNAUTHORIZED
                response.writer.println("Token is invalid or expired")
                return
            }
        }

        filterChain.doFilter(request, response)
    }
}