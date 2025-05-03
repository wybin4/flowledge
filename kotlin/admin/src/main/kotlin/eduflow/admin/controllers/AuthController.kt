package eduflow.admin.controllers

import eduflow.admin.ldap.CustomLdapUserDetails
import eduflow.admin.ldap.LDAPService
import eduflow.admin.models.LDAPServiceModel
import eduflow.admin.models.UserServicesModel
import eduflow.admin.services.TokenService
import eduflow.admin.services.UserService
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.ldap.authentication.LdapAuthenticationProvider
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val tokenService: TokenService,
    private val ldapService: LDAPService,
    private val userService: UserService,
    private val ldapAuthenticationProvider: LdapAuthenticationProvider,
) {

    @PostMapping("/login")
    fun ldapLogin(@RequestBody request: LdapLoginRequest): Mono<LoginResponse> {
        val authentication: Authentication = UsernamePasswordAuthenticationToken(request.username, request.password)
        try {
            val authenticated = ldapAuthenticationProvider.authenticate(authentication)
            SecurityContextHolder.getContext().authentication = authenticated


            val memberOf = (authenticated.principal as? CustomLdapUserDetails)?.attributes?.get("memberOf")
            val groupNames = if (memberOf != null) {
                (memberOf as List<*>).map { dn ->
                    ldapService.extractGroupName(dn.toString())
                }
            } else {
                emptyList()
            }

            return tokenService.userRepository.findByUsername(request.username)
                .switchIfEmpty(userService.createUser(request.username))
                .flatMap { user ->
                    if (user == null) {
                        Mono.error(IllegalStateException("User is null after switchIfEmpty"))
                    } else {
                        val updatedUser = user.copy(
                            services = user.services?.copy(
                                ldap = user.services?.ldap?.copy(
                                    memberOf = groupNames
                                ) ?: LDAPServiceModel(memberOf = groupNames)
                            ) ?: UserServicesModel(ldap = LDAPServiceModel(memberOf = groupNames))
                        )

                        tokenService.updateTokens(updatedUser)
                            .map { updated ->
                                LoginResponse(
                                    updated.services?.resume?.jwtToken!!,
                                    updated.services?.resume?.refreshToken!!
                                )
                            }
                    }
                }


        } catch (e: Exception) {
            println("Authentication failed: ${e.message}")
            throw e
        }
    }

    @PostMapping("/refresh")
    fun refreshToken(@RequestBody request: RefreshTokenRequest): Mono<RefreshTokenResponse> {
        val userId = tokenService.validateToken(request.refreshToken)
        return if (userId != null) {
            tokenService.userRepository.findById(userId)
                .flatMap { user ->
                    if (user != null && user.services?.resume?.refreshToken == request.refreshToken) {
                        tokenService.updateTokens(user)
                            .map { updatedUser ->
                                RefreshTokenResponse(
                                    updatedUser.services?.resume?.jwtToken!!,
                                    updatedUser.services?.resume?.refreshToken!!
                                )
                            }
                    } else {
                        Mono.error(IllegalArgumentException("Invalid refresh token"))
                    }
                }
        } else {
            Mono.error(IllegalArgumentException("Invalid refresh token"))
        }
    }

    data class RefreshTokenRequest(
        val refreshToken: String
    )

    data class RefreshTokenResponse(
        val jwtToken: String,
        val refreshToken: String
    )

    data class LdapLoginRequest(
        val username: String,
        val password: String
    )

    data class LoginResponse(
        val jwtToken: String,
        val refreshToken: String
    )
}