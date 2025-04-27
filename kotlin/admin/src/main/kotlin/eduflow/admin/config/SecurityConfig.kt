package eduflow.admin.config

import eduflow.admin.filters.JwtTokenFilter
import eduflow.admin.services.TokenService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.AuthenticationException
import org.springframework.security.ldap.DefaultSpringSecurityContextSource
import org.springframework.security.ldap.authentication.BindAuthenticator
import org.springframework.security.ldap.authentication.LdapAuthenticationProvider
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter

@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val tokenService: TokenService
) {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .securityContext { it.requireExplicitSave(false) }
            .authorizeHttpRequests { requests ->
                requests
                    .requestMatchers("/websocket").permitAll()
                    .requestMatchers(HttpMethod.OPTIONS, "/api/**").permitAll()
                    .requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers("/api/**").authenticated()
                    .anyRequest().authenticated()
            }
            .exceptionHandling { exceptions ->
                exceptions.authenticationEntryPoint { request: HttpServletRequest, response: HttpServletResponse, authException: AuthenticationException ->
                    response.status = HttpServletResponse.SC_UNAUTHORIZED
                    response.writer.println("Unauthorized: ${authException.message}")
                }
            }
            .addFilterBefore(JwtTokenFilter(tokenService), UsernamePasswordAuthenticationFilter::class.java)

        return http.build()
    }


    @Bean
    fun ldapAuthenticationProvider(): LdapAuthenticationProvider {
        val contextSource = DefaultSpringSecurityContextSource("ldap://localhost:389/dc=example,dc=org")
        contextSource.setUserDn("cn=admin,dc=example,dc=org")
        contextSource.setPassword("admin")
        contextSource.afterPropertiesSet()

        val authenticator = BindAuthenticator(contextSource)
        authenticator.setUserDnPatterns(arrayOf("uid={0},dc=example,dc=org")) // Это ок

        authenticator.setUserSearch(
            org.springframework.security.ldap.search.FilterBasedLdapUserSearch(
                "", "(uid={0})", contextSource
            )
        )

        return LdapAuthenticationProvider(authenticator)
    }


}