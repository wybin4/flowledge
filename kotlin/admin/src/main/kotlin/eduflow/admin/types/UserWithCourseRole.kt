package flowledge.admin.types

data class UserWithCourseRole(
    val userId: String,
    val roles: List<String>
)