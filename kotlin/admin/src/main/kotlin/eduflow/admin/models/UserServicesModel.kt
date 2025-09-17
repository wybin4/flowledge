package flowledge.admin.models

import flowledge.admin.user.models.LDAPServiceModel
import flowledge.admin.user.models.PasswordServiceModel
import flowledge.admin.user.models.ResumeServiceModel
import flowledge.user_model.UserServices

data class UserServicesModel(
    override var resume: ResumeServiceModel? = null,
    override val ldap: LDAPServiceModel? = null,
    override val password: PasswordServiceModel? = null,
) : UserServices
