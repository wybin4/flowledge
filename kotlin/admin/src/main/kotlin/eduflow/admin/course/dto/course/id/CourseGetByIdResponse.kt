package flowledge.admin.course.dto.course.id

interface CourseGetByIdResponse {
    val _id: String
    val title: String
    val imageUrl: String?
    val description: String
    val tags: List<String>?
    val versionName: String
}