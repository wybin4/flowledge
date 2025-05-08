package eduflow.admin.user.models

import eduflow.user.LDAPService

data class LDAPServiceModel(
    override var memberOf: List<String>? = null,
) : LDAPService
