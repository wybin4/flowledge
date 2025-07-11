package flowledge.admin.config

import flowledge.admin.filters.JwtTokenFilter
import flowledge.admin.ldap.CustomLdapUserDetailsMapper
import flowledge.admin.ldap.LDAPService
import flowledge.admin.services.TokenService
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
        val ldapUrl = ldapService.getUrl()
        val adminDn = ldapService.getAdminDn()
        val adminPassword = ldapService.getAdminPassword()
        val baseUserDn = ldapService.getUserDn()
        val userSearchFilter = ldapService.getUserSearchFilter()

        val contextSource = DefaultSpringSecurityContextSource(ldapUrl)
        contextSource.userDn = adminDn
        contextSource.password = adminPassword
        contextSource.afterPropertiesSet()

        val authenticator = BindAuthenticator(contextSource)

        authenticator.setUserSearch(
            FilterBasedLdapUserSearch(
                baseUserDn,
                userSearchFilter,
                contextSource
            ).apply {
                setReturningAttributes(arrayOf("uid", "mail", "cn", "sn", "memberOf"))
            }
        )

        val provider = LdapAuthenticationProvider(authenticator)
        provider.setUserDetailsContextMapper(CustomLdapUserDetailsMapper())

        return provider
    }

    @Bean
    fun authenticationManager(): AuthenticationManager {
        val providers = mutableListOf<AuthenticationProvider>()

        if (ldapService.isEnabled()) {
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