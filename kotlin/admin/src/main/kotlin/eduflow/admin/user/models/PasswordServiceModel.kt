package flowledge.admin.user.models

import flowledge.user.PasswordService

data class PasswordServiceModel(
    override var bcrypt: String? = null,
) : PasswordService
