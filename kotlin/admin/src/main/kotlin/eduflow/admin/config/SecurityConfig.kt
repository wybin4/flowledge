package eduflow.admin.config

import eduflow.admin.filters.JwtTokenFilter
import eduflow.admin.ldap.CustomLdapUserDetailsMapper
import eduflow.admin.ldap.LDAPService
import eduflow.admin.services.TokenService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.authentication.ProviderManager
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.ldap.DefaultSpringSecurityContextSource
import org.springframework.security.ldap.authentication.BindAuthenticator
import org.springframework.security.ldap.authentication.LdapAuthenticationProvider
import org.springframework.security.ldap.search.FilterBasedLdapUserSearch
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter

@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val tokenService: TokenService,
    private val ldapService: LDAPService
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
                exceptions.authenticationEntryPoint { _: HttpServletRequest, response: HttpServletResponse, authException: AuthenticationException ->
                    response.status = HttpServletResponse.SC_UNAUTHORIZED
                    response.writer.println("Unauthorized: ${authException.message}")
                }
            }
            .addFilterBefore(JwtTokenFilter(tokenService), UsernamePasswordAuthenticationFilter::class.java)

        return http.build()
    }

    @Bean
    fun ldapAuthenticationProvider(): LdapAuthenticationProvider {
        val ldapUrl = ldapService.getLdapUrl()
        val adminDn = ldapService.getLdapAdminDn()
        val adminPassword = ldapService.getLdapAdminPassword()
        val userDnPattern = ldapService.getLdapUserDnPattern()
        val userSearchFilter = ldapService.getLdapUserSearchFilter()

        val contextSource = DefaultSpringSecurityContextSource(ldapUrl)
        contextSource.userDn = adminDn
        contextSource.password = adminPassword
        contextSource.afterPropertiesSet()

        val authenticator = BindAuthenticator(contextSource)
        authenticator.setUserDnPatterns(arrayOf(userDnPattern))

        authenticator.setUserSearch(
            FilterBasedLdapUserSearch(
                "",
                userSearchFilter,
                contextSource
            )
        )

        val provider = LdapAuthenticationProvider(authenticator)
        provider.setUserDetailsContextMapper(CustomLdapUserDetailsMapper())
        return provider
    }

    @Bean
    fun authenticationManager(): AuthenticationManager {
        val providers = mutableListOf<AuthenticationProvider>()

        if (ldapService.isLdapEnabled()) {
            providers.add(ldapAuthenticationProvider())
        }

        return ProviderManager(providers, NoOpAuthenticationManager())
    }

    class NoOpAuthenticationManager : AuthenticationManager {
        override fun authenticate(authentication: Authentication): Authentication? {
            return null
        }
    }
}