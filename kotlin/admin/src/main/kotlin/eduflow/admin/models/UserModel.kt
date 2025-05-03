package eduflow.admin.models

import eduflow.user.User
import eduflow.user.UserEmail
import eduflow.user.UserType
import org.springframework.data.mongodb.core.mapping.Document
import org.springframework.data.mongodb.core.mapping.Field
import java.util.*

@Document
data class UserModel(
    override val _id: String,
    override val _updatedAt: Date,
    @Field("type")
    override val type: UserType,
    override val createdAt: Date,
    override val active: Boolean,
    override val email: UserEmail?,
    override val name: String,
    override val settings: UserSettingModel,
    override val username: String,
    override var services: UserServicesModel? = null
) : User


