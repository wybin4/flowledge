package eduflow.admin.user.dto.get

data class UserGetSmallResponse(
    override val _id: String,
    override val name: String,
    override val username: String,
    override val avatar: String,
) : UserGetResponse
