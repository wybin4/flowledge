package flowledge.admin.course.dto.subscription.progress

data class CourseSendProgressRequest(
    val subscriptionId: String,
    val lessonId: String,
    val type: CourseProgressTypeRequest,
    val progress: Double
)