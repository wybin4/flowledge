package eduflow.admin.user.services

import eduflow.admin.dto.SettingUpdateRequest
import eduflow.admin.models.UserSettingModel
import eduflow.admin.services.PaginationAndSortingService
import eduflow.admin.user.dto.get.UserGetBigResponse
import eduflow.admin.user.dto.get.UserGetRequest
import eduflow.admin.user.dto.get.UserGetResponse
import eduflow.admin.user.dto.get.UserGetSmallResponse
import eduflow.admin.user.models.UserModel
import eduflow.admin.user.repositories.UserRepository
import eduflow.admin.utils.generateId
import eduflow.user.DefaultRoles
import eduflow.user.Language
import eduflow.user.Theme
import eduflow.user.toLowerCase
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.bcrypt.BCrypt
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.util.*

@Service
class UserService(private val userRepository: UserRepository) : PaginationAndSortingService() {
    fun passwordLogin(username: String, password: String): Mono<UserModel> {
        return userRepository.findByUsername(username)
            .switchIfEmpty(Mono.error(IllegalArgumentException("User not found")))
            .flatMap { user ->
                val hashedPassword = user?.services?.password?.bcrypt
                if (hashedPassword != null && BCrypt.checkpw(password, hashedPassword)) {
                    Mono.just(user)
                } else {
                    Mono.error(IllegalArgumentException("Invalid password"))
                }
            }
    }

    fun setSetting(setting: SettingUpdateRequest, user: UserModel?): Mono<UserModel> {
        if (user == null) {
            return Mono.error(IllegalArgumentException("User not found"))
        }

        val updatedSettings = user.settings.copy()

        when (setting.id) {
            "theme" -> updatedSettings.theme = Theme.valueOf(setting.value)
            "language" -> updatedSettings.language = Language.valueOf(setting.value)
            else -> return Mono.error(IllegalArgumentException("Invalid setting ID"))
        }

        val updatedUser = user.copy(settings = updatedSettings)
        return userRepository.save(updatedUser)
    }

    fun getAllUsers(request: UserGetRequest): Flux<out UserGetResponse> {
        return if (request.isSmall) {
            userRepository.findAllExcludingIds(request.excludedIds, request.searchQuery)
                .take(request.pageSize.toLong())
                .map { user ->
                    UserGetSmallResponse(
                        _id = user._id,
                        name = user.name,
                        username = user.username,
                        avatar = "" // TODO()
                    )
                }
        } else {
            val options = request.toMap()
            this.getPaginatedAndSorted<UserModel, UserModel>(
                options,
                userRepository
            ).flatMapMany { users ->
                Flux.fromIterable(users)
            }.map { user ->
                UserGetBigResponse(
                    _id = user._id,
                    name = user.name,
                    username = user.username,
                    avatar = "", // TODO()
                    roles = user.roles,
                    active = user.active
                )
            }
        }
    }

    fun createUser(
        username: String,
        name: String? = null,
        roles: List<String>? = null
    ): Mono<UserModel> {
        val now = Date()
        val newUser = UserModel(
            _id = generateId(),
            _updatedAt = now,
            roles = roles?.takeIf { it.isNotEmpty() } ?: listOf(DefaultRoles.USER.toLowerCase()),
            createdAt = now,
            active = true,
            email = null,
            name = name ?: username,
            settings = UserSettingModel(
                theme = Theme.AUTO,
                language = Language.EN,
            ),
            username = username
        )
        return userRepository.save(newUser)
    }

    fun checkUsernameUniqueness(username: String, existingUserId: String? = null): Mono<UserModel> {
        return userRepository.findByUsername(username)
            .flatMap<UserModel> { userWithSameUsername ->
                if (userWithSameUsername?._id != existingUserId) {
                    Mono.error(ResponseStatusException(HttpStatus.CONFLICT, "User with this username already exists"))
                } else {
                    Mono.empty()
                }
            }
            .switchIfEmpty(Mono.empty())
    }
}