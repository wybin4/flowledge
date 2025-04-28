package eduflow.admin.course.types

data class CourseEditor(
    val _id: String,
    val name: String,
    val username: String,
    val roles: List<String>
)
