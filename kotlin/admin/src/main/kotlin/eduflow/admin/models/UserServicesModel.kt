package eduflow.admin.models

import eduflow.user.UserServices

data class UserServicesModel(
    override var resume: ResumeServiceModel? = null,
    override val ldap: LDAPServiceModel? = null,
) : UserServices
