package eduflow.admin.services

import eduflow.admin.models.ResumeServiceModel
import eduflow.admin.models.UserModel
import eduflow.admin.models.UserServicesModel
import eduflow.admin.models.UserSettingModel
import eduflow.admin.repositories.UserRepository
import eduflow.user.Language
import eduflow.user.Theme
import eduflow.user.UserType
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import java.util.*

@Service
class UserService(
    private val userRepository: UserRepository,
) {
    fun createUser(username: String): Mono<UserModel> {
        val now = Date()
        val newUser = UserModel(
            _id = UUID.randomUUID().toString(),
            _updatedAt = now,
            type = UserType.USER,
            createdAt = now,
            active = true,
            email = null,
            name = username,
            settings = UserSettingModel(
                theme = Theme.AUTO,
                language = Language.EN,
            ),
            username = username,
            services = UserServicesModel(
                resume = ResumeServiceModel(
                    jwtToken = "",
                    refreshToken = ""
                )
            )
        )
        return userRepository.save(newUser)
    }
}