package eduflow.admin.course.dto.editor

data class CourseEditorsUpdateRequest(
    val courseId: String,
    val editors: List<CourseEditorsUpdateRequestItem>,
)
