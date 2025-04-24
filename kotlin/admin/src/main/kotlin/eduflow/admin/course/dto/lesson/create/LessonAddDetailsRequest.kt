package eduflow.admin.course.dto.lesson.create

import eduflow.admin.course.types.TimeUnit

data class LessonAddDetailsRequest (
    val _id: String,
    val title: String,
    val time: String?,
    val timeUnit: TimeUnit,
    val autoDetect: Boolean,
    val imageUrl: String?
): LessonCreateRequest()