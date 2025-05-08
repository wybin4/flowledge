package eduflow.admin.user.dto

data class UserUpdateRequest(
    val username: String? = null,
    val name: String? = null,
    val password: String? = null,
    val roles: List<String>? = null,
    val active: Boolean? = null,
)
