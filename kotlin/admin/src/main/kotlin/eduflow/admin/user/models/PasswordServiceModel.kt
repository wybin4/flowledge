package eduflow.admin.user.models

import eduflow.user.PasswordService

data class PasswordServiceModel(
    override var bcrypt: String? = null,
) : PasswordService
