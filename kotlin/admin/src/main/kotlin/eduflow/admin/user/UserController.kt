package eduflow.admin.user

import eduflow.admin.dto.SettingUpdateRequest
import eduflow.admin.user.dto.UserCreateRequest
import eduflow.admin.user.dto.UserUpdateRequest
import eduflow.admin.user.dto.get.UserGetRequest
import eduflow.admin.user.dto.get.UserGetResponse
import eduflow.admin.user.dto.get.id.UserGetByIdBigResponse
import eduflow.admin.user.dto.get.id.UserGetByIdResponse
import eduflow.admin.user.dto.get.id.UserGetByIdSmallResponse
import eduflow.admin.user.models.UserModel
import eduflow.admin.user.repositories.UserRepository
import eduflow.admin.user.services.PasswordService
import eduflow.admin.user.services.UserService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api")
class UserController(
    private val userRepository: UserRepository,
    private val userService: UserService,
    private val passwordService: PasswordService
) {

    @GetMapping("/users.get/{id}")
    fun getUser(
        @PathVariable id: String,
        @RequestParam(name = "isSmall", required = false) isSmall: Boolean? = true
    ): Mono<out UserGetByIdResponse> {
        var userId = id
        if (userId == "me") {
            val authentication = SecurityContextHolder.getContext().authentication
            val user = authentication.principal as UserModel
            userId = user._id
        }
        return userRepository.findById(userId)
            .flatMap { user ->
                if (user == null) {
                    Mono.error(ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"))
                } else {
                    if (isSmall == true) {
                        Mono.just(
                            UserGetByIdSmallResponse(
                                _id = user._id,
                                name = user.name,
                                username = user.username,
                                avatar = "", // TODO()
                                settings = user.settings,
                                services = user.services,
                                roles = user.roles
                            )
                        )
                    } else {
                        Mono.just(
                            UserGetByIdBigResponse(
                                _id = user._id,
                                name = user.name,
                                username = user.username,
                                avatar = "", // TODO()
                                active = user.active,
                                roles = user.roles
                            )
                        )
                    }
                }
            }
    }

    @PostMapping("/users.set-setting")
    fun setUserSettings(
        @RequestParam userId: String,
        @RequestBody settingUpdateRequest: SettingUpdateRequest
    ): Mono<UserModel> {
        return userRepository.findById(userId)
            .flatMap { user ->
                return@flatMap userService.setSetting(settingUpdateRequest, user)
            }
    }

    @GetMapping("/users.get")
    fun getAllUsers(request: UserGetRequest): Flux<out UserGetResponse> {
        return userService.getAllUsers(request)
    }

    @GetMapping("/users.count")
    fun getUsersCount(@RequestParam(required = false) searchQuery: String?): Mono<ResponseEntity<Long>> {
        return userRepository.countByUsernameContainingIgnoreCase(searchQuery)
            .map { ResponseEntity.ok(it) }
    }

    @PostMapping("/users.create")
    fun createUser(@RequestBody request: UserCreateRequest): Mono<ResponseEntity<UserModel>> {
        return userService.checkUsernameUniqueness(request.username)
            .then(
                userService.createUser(
                    request.username,
                    request.name,
                    request.roles
                ).flatMap { user ->
                    request.password.let { password ->
                        passwordService.updatePassword(user, password)
                    }
                }.flatMap { userWithUpdatedPassword ->
                    userRepository.save(userWithUpdatedPassword)
                }.map { savedUser ->
                    ResponseEntity.status(HttpStatus.CREATED).body(savedUser)
                }
            )
            .onErrorResume { e ->
                when (e) {
                    is ResponseStatusException -> Mono.just(ResponseEntity.status(e.statusCode).build())
                    else -> Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build())
                }
            }
    }

    @PostMapping("/users.update/{id}")
    fun updateUser(
        @PathVariable id: String,
        @RequestBody request: UserUpdateRequest
    ): Mono<ResponseEntity<UserModel>> {
        return userRepository.findById(id)
            .switchIfEmpty(
                Mono.error(
                    ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                    )
                )
            )
            .flatMap { existingUser ->
                request.username?.let { newUsername ->
                    existingUser?.let { Mono.just(it) }?.let {
                        userService.checkUsernameUniqueness(newUsername, id)
                            .then(it)
                    }
                } ?: existingUser?.let { Mono.just(it) }
            }
            .flatMap { existingUser ->
                val updatedUser = existingUser.copy(
                    username = request.username ?: existingUser.username,
                    name = request.name ?: existingUser.name,
                    roles = request.roles ?: existingUser.roles,
                    active = request.active ?: existingUser.active
                )
                request.password?.takeIf { it.isNotEmpty() }?.let { password ->
                    passwordService.updatePassword(updatedUser, password)
                } ?: Mono.just(updatedUser)
            }
            .flatMap { userWithUpdatedPassword ->
                userRepository.save(userWithUpdatedPassword)
            }
            .map { savedUser ->
                ResponseEntity.ok(savedUser)
            }
            .onErrorResume { e ->
                when (e) {
                    is ResponseStatusException -> Mono.just(ResponseEntity.status(e.statusCode).build())
                    else -> Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build())
                }
            }
    }

    @DeleteMapping("/users.delete/{id}")
    fun deleteUser(@PathVariable id: String): Mono<ResponseEntity<Void>> {
        return userRepository.deleteById(id)
            .then(Mono.just<ResponseEntity<Void>>(ResponseEntity.noContent().build()))
            .onErrorResume { Mono.just(ResponseEntity.notFound().build()) }
    }
}