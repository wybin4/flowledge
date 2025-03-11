package eduflow.permission

interface Permission {
    val _id: String
    val roles: List<String>
}
