package eduflow.admin.course.dto.course.get

interface CourseGetByIdResponse {
    val _id: String
    val title: String
    val imageUrl: String?
    val description: String
}