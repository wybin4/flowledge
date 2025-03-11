package eduflow

import java.util.*

enum class UserType {
    USER, ADMIN
}

data class UserEmail(
    val address: String,
    val verified: Boolean
)

enum class Theme {
    LIGHT, DARK, AUTO
}

enum class Language {
    EN, RU
}

data class UserSetting(
    val theme: Theme,
    val language: Language
)

interface User: Record {
    val createdAt: Date
    val type: UserType
    val active: Boolean
    val username: String
    val name: String
    val email: UserEmail?
    val settings: List<UserSetting>
}