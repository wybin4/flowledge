package eduflow.admin.user.dto.get.id

data class UserGetByIdBigResponse(
    override val _id: String,
    override val name: String,
    override val username: String,
    override val avatar: String,
    val active: Boolean,
    val roles: List<String>
) : UserGetByIdResponse
