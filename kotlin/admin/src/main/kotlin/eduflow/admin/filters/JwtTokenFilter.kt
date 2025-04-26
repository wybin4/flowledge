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
        val token = request.getHeader("Authorization")?.removePrefix("Bearer ")

        if (token != null) {
            val userId = tokenService.validateToken(token)
            if (userId != null) {
                val user = tokenService.userRepository.findById(userId).block()

                if (user != null && user.services?.resume?.jwtToken == token) {
                    val authentication = UsernamePasswordAuthenticationToken(user, null, emptyList())
                    SecurityContextHolder.getContext().authentication = authentication
                    println("Authentication set for user: ${user.username}")
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
