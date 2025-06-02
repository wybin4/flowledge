package flowledge.admin.user.dto.get.id

import flowledge.admin.models.UserServicesModel
import flowledge.admin.models.UserSettingModel

data class UserGetByIdSmallResponse(
    override val _id: String,
    override val name: String,
    override val username: String,
    override val avatar: String,
    val settings: UserSettingModel,
    val services: UserServicesModel? = null,
    override val roles: List<String>
) : UserGetByIdResponse
