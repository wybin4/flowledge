package eduflow.admin.models

import eduflow.admin.user.models.LDAPServiceModel
import eduflow.admin.user.models.PasswordServiceModel
import eduflow.admin.user.models.ResumeServiceModel
import eduflow.user.UserServices

data class UserServicesModel(
    override var resume: ResumeServiceModel? = null,
    override val ldap: LDAPServiceModel? = null,
    override val password: PasswordServiceModel? = null,
) : UserServices
