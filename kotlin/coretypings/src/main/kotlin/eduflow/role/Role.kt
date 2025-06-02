package flowledge.role

interface Role {
    val _id: String
    val name: String
    val description: String
    val scopes: List<RoleScope>
}

