package flowledge.admin.course.dto.subscription.progress.initiate

import flowledge.admin.course.dto.subscription.progress.CourseProgressTypeRequest

data class CourseInitiateProgressRequest(
    val courseId: String,
    val lessonId: String,
    val type: CourseProgressTypeRequest
)