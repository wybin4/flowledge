package flowledge.admin.models

import flowledge.role.Role
import flowledge.role.RoleScope
import org.springframework.data.mongodb.core.mapping.Document
import org.springframework.data.mongodb.core.mapping.Field

@Document
data class RoleModel(
    override val _id: String,
    override val description: String,
    override val name: String,
    @Field("scopes")
    override val scopes: List<RoleScope>
) : Role
