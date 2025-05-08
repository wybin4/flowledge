package eduflow.admin.user.services

import eduflow.admin.models.UserServicesModel
import eduflow.admin.user.models.PasswordServiceModel
import eduflow.admin.user.models.UserModel
import org.springframework.security.crypto.bcrypt.BCrypt
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class PasswordService {

    private val maxPasswordLength = 72

    fun updatePassword(existingUser: UserModel, newPassword: String?): Mono<UserModel> {
        return if (newPassword != null) {
            if (newPassword.length > maxPasswordLength) {
                Mono.error(IllegalArgumentException("Password length exceeds the maximum allowed length of $maxPasswordLength characters"))
            } else {
                val hashedPassword = hashPassword(newPassword)
                val updatedServices = existingUser.services?.copy(
                    password = PasswordServiceModel(bcrypt = hashedPassword)
                ) ?: UserServicesModel(password = PasswordServiceModel(bcrypt = hashedPassword))

                val updatedUser = existingUser.copy(services = updatedServices)
                Mono.just(updatedUser)
            }
        } else {
            Mono.just(existingUser)
        }
    }

    private fun hashPassword(password: String): String {
        return BCrypt.hashpw(password, BCrypt.gensalt())
    }
}