package flowledge.admin.user.dto.get

data class UserGetBigResponse(
    override val _id: String,
    override val name: String,
    override val username: String,
    override val avatar: String,
    val active: Boolean,
    val roles: List<String>
) : UserGetResponse
