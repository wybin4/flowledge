package flowledge.admin.course.dto.course.hub.get

import flowledge.admin.course.dto.course.CourseCreatorResponse
import java.util.*

data class CourseHubGetResponse(
    val _id: String,
    val title: String,
    val imageUrl: String? = null,
    val u: CourseCreatorResponse,
    val createdAt: Date,
)
