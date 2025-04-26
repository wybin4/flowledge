package eduflow.admin.services

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import eduflow.admin.models.ResumeServiceModel
import eduflow.admin.models.UserModel
import eduflow.admin.repositories.UserRepository
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import java.util.*

@Service
class TokenService(
    val userRepository: UserRepository
) {
    private val secret = "your-secret-key"
    private val algorithm = Algorithm.HMAC256(secret)

    fun generateJwtToken(user: UserModel): String {
        return JWT.create()
            .withSubject(user._id) // Используем ID пользователя как subject
            .withExpiresAt(Date(System.currentTimeMillis() + 86400000)) // Срок действия 1 день
            .sign(algorithm)
    }

    fun generateRefreshToken(user: UserModel): String {
        return JWT.create()
            .withSubject(user._id) // Используем ID пользователя как subject
            .withExpiresAt(Date(System.currentTimeMillis() + 7 * 86400000)) // Срок действия 7 дней
            .sign(algorithm)
    }

    fun validateToken(token: String): String? {
        return try {
            val verifier = JWT.require(algorithm).build()
            val jwt = verifier.verify(token)
            jwt.subject // Возвращаем ID пользователя
        } catch (e: Exception) {
            null
        }
    }

    fun updateTokens(user: UserModel): Mono<UserModel> {
        val resume = user.services?.resume ?: ResumeServiceModel()
        resume.jwtToken = generateJwtToken(user)
        resume.refreshToken = generateRefreshToken(user)
        user.services?.resume = resume
        return userRepository.save(user)
    }
}