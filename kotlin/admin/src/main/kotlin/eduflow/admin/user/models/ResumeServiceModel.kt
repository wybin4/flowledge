package eduflow.admin.user.models

import eduflow.user.ResumeService

data class ResumeServiceModel(
    override var jwtToken: String? = null,
    override var refreshToken: String? = null,
) : ResumeService
