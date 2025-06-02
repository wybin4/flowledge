package flowledge.admin.controllers

import flowledge.admin.ldap.CustomLdapUserDetails
import flowledge.admin.ldap.LDAPService
import flowledge.admin.models.UserServicesModel
import flowledge.admin.services.TokenService
import flowledge.admin.user.models.LDAPServiceModel
import flowledge.admin.user.models.UserModel
import flowledge.admin.user.services.UserService
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
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
    private val ldapAuthenticationProvider: LdapAuthenticationProvider
) {

    @PostMapping("/login")
    fun ldapLogin(@RequestBody request: LdapLoginRequest): Mono<LoginResponse> {
        val authentication: Authentication = UsernamePasswordAuthenticationToken(request.username, request.password)

        return try {
            val authenticated = authenticateWithLdap(authentication)
            val groupNames = extractGroupNames(authenticated)

            return tokenService.userRepository.findByUsername(request.username)
                .switchIfEmpty(userService.createUser(request.username))
                .flatMap { user ->
                    if (user == null) {
                        Mono.error(IllegalStateException("User is null after switchIfEmpty"))
                    } else {
                        val updatedUser = updateUserWithGroups(user, groupNames)
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
            println("LDAP Authentication failed: ${e.message}")
            try {
                handlePasswordAuthentication(request)
            } catch (e: Exception) {
                println("Password Authentication failed: ${e.message}")
                throw e
            }
        }
    }

    private fun authenticateWithLdap(authentication: Authentication): Authentication {
        return ldapAuthenticationProvider.authenticate(authentication)
    }

    private fun extractGroupNames(authenticated: Authentication): List<String> {
        val memberOf = (authenticated.principal as? CustomLdapUserDetails)?.attributes?.get("memberOf")
        return if (memberOf != null) {
            (memberOf as List<*>).map { dn ->
                ldapService.extractGroupName(dn.toString())
            }
        } else {
            emptyList()
        }
    }

    private fun updateUserWithGroups(user: UserModel, groupNames: List<String>): UserModel {
        return user.copy(
            services = user.services?.copy(
                ldap = user.services?.ldap?.copy(
                    memberOf = groupNames
                ) ?: LDAPServiceModel(memberOf = groupNames)
            ) ?: UserServicesModel(ldap = LDAPServiceModel(memberOf = groupNames))
        )
    }

    private fun handlePasswordAuthentication(request: LdapLoginRequest): Mono<LoginResponse> {
        return userService.passwordLogin(request.username, request.password)
            .flatMap { user ->
                val groupNames = listOf<String>()
                val updatedUser = updateUserWithGroups(user, groupNames)
                tokenService.updateTokens(updatedUser)
                    .map { updated ->
                        LoginResponse(
                            updated.services?.resume?.jwtToken!!,
                            updated.services?.resume?.refreshToken!!
                        )
                    }
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