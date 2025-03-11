package eduflow.user

import eduflow.Record
import java.util.*

interface User: Record {
    val createdAt: Date
    val type: UserType
    val active: Boolean
    val username: String
    val name: String
    val email: UserEmail?
    val settings: UserSetting
}