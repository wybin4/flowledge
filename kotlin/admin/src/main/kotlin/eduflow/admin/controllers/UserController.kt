package eduflow.admin.controllers

import eduflow.admin.dto.SettingUpdateRequest
import eduflow.admin.models.UserModel
import eduflow.admin.repositories.UserRepository
import eduflow.user.Language
import eduflow.user.Theme
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api")
class UserController(private val userRepository: UserRepository) {

    @GetMapping("/users.get")
    fun getUser(@RequestParam id: String): Mono<UserModel?> {
        return userRepository.findById(id)
    }

    @PostMapping("/users.set-setting")
    fun setUserSettings(
        @RequestParam userId: String,
        @RequestBody settingUpdateRequest: SettingUpdateRequest
    ): Mono<UserModel> {
        return userRepository.findById(userId)
            .flatMap { user ->
                if (user == null) {
                    return@flatMap Mono.error<UserModel>(IllegalArgumentException("User not found"))
                }

                val updatedSettings = user.settings.copy()

                when (settingUpdateRequest.id) {
                    "theme" -> updatedSettings.theme = Theme.valueOf(settingUpdateRequest.value)
                    "language" -> updatedSettings.language = Language.valueOf(settingUpdateRequest.value)
                    else -> return@flatMap Mono.error<UserModel>(IllegalArgumentException("Invalid setting ID"))
                }

                val updatedUser = user.copy(settings = updatedSettings)
                userRepository.save(updatedUser)
            }
    }
}