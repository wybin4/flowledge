package flowledge.admin.user.dto

data class UserCreateRequest(
    val username: String,
    val name: String,
    val password: String,
    val roles: List<String>? = null
)
