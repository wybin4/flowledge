package eduflow.admin.course.dto.course.section

data class CourseGetSectionResponse(
    val _id: String,
    val title: String,

    val isVisible: Boolean?
)