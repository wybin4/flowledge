package eduflow.admin.user.models

import eduflow.admin.models.UserServicesModel
import eduflow.admin.models.UserSettingModel
import eduflow.user.User
import eduflow.user.UserEmail
import org.springframework.data.mongodb.core.mapping.Document
import java.util.*

@Document
data class UserModel(
    override val _id: String,
    override val _updatedAt: Date,
    override val roles: List<String>,
    override val createdAt: Date,
    override val active: Boolean,
    override val email: UserEmail?,
    override val name: String,
    override val settings: UserSettingModel,
    override val username: String,
    override var services: UserServicesModel? = null
) : User {
    data class BaseUser(val _id: String, val name: String, val username: String)

    fun toBase(): BaseUser {
        return BaseUser(
            _id = _id,
            name = name,
            username = username,
        )
    }
}


