package eduflow.admin.user.dto.get.id

import eduflow.admin.models.UserServicesModel
import eduflow.admin.models.UserSettingModel

data class UserGetByIdSmallResponse(
    override val _id: String,
    override val name: String,
    override val username: String,
    override val avatar: String,
    val settings: UserSettingModel,
    val services: UserServicesModel? = null
) : UserGetByIdResponse
