package eduflow.user

import eduflow.Record
import java.util.*

interface User : Record {
    val createdAt: Date
    val roles: List<String>
    val active: Boolean
    val username: String
    val name: String
    val email: UserEmail?
    val settings: UserSetting
    val services: UserServices?
}