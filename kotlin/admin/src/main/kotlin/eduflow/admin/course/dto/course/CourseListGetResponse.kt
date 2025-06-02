package flowledge.admin.course.dto.course

data class CourseListGetResponse(
    val _id: String,
    val title: String,
    val imageUrl: String? = null,
    val isFavourite: Boolean? = null,
)
