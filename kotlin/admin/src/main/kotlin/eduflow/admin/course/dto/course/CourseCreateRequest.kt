package eduflow.admin.course.dto

import eduflow.admin.course.models.CourseCreatorModel

data class CourseCreateRequest(
    val title: String,
    val description: String,
    val imageUrl: String? = null,
    val u: CourseCreatorModel
)