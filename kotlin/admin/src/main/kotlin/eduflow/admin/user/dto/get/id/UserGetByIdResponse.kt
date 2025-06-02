package flowledge.admin.user.dto.get.id

interface UserGetByIdResponse {
    val _id: String
    val name: String
    val username: String
    val avatar: String
    val roles: List<String>
}
