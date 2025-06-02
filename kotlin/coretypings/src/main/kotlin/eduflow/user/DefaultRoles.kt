package flowledge.user

enum class DefaultRoles {
    USER, EDITOR, ADMIN, OWNER, MODERATOR
}

fun DefaultRoles.toLowerCase(): String {
    return this.name.lowercase()
}