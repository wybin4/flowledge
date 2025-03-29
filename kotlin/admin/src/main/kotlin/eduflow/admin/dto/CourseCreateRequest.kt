package eduflow.admin.dto

import eduflow.admin.models.CourseCreatorModel

data class CourseCreateRequest(
    val title: String,
    val description: String,
    val u: CourseCreatorModel
)