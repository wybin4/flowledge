package eduflow.admin.course.dto.subscription.progress

data class CourseInitiateProgressRequest(
    val courseId: String,
    val lessonId: String,
    val type: CourseInitiateProgressTypeRequest
)