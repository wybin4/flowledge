package eduflow.admin.models

import eduflow.role.Role
import eduflow.role.RoleScope
import org.springframework.data.mongodb.core.mapping.Document
import org.springframework.data.mongodb.core.mapping.Field

@Document
data class RoleModel(
    override val _id: String,
    override val description: String,
    override val name: String,
    @Field("scope")
    override val scope: RoleScope
) : Role
