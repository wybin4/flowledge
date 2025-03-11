package eduflow.admin.models

import eduflow.permission.Permission
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class PermissionModel(
    override val _id: String,
    override val roles: List<String>
) : Permission
