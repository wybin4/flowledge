package flowledge.admin.user.models

import flowledge.user.ResumeService

data class ResumeServiceModel(
    override var jwtToken: String? = null,
    override var refreshToken: String? = null,
) : ResumeService
