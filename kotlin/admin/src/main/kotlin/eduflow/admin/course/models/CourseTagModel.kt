package flowledge.admin.course.models

import flowledge.course.CourseTag
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseTagModel(
    override val _id: String,
    override val name: String,
) : CourseTag
