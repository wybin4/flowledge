package flowledge.admin.services

import flowledge.admin.user.models.UserModel
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service

@Service
class AuthenticationService {
    fun getCurrentUser(): UserModel {
        val authentication = SecurityContextHolder.getContext().authentication
        return authentication.principal as UserModel
    }
}