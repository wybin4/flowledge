package eduflow.admin.models

import eduflow.user.ResumeService
import eduflow.user.UserServices

data class UserServicesModel(
    override var resume: ResumeService?,
) : UserServices
