package eduflow.admin.course.dto.subscription.progress.initiate

import eduflow.admin.course.dto.subscription.progress.CourseProgressTypeRequest

data class CourseInitiateProgressRequest(
    val courseId: String,
    val lessonId: String,
    val type: CourseProgressTypeRequest
)