package flowledge.admin.user.models

import flowledge.user.LDAPService

data class LDAPServiceModel(
    override var memberOf: List<String>? = null,
) : LDAPService
