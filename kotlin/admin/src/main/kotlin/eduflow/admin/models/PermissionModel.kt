package flowledge.admin.models

import flowledge.permission.Permission
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class PermissionModel(
    override val _id: String,
    override val roles: List<String>
) : Permission
