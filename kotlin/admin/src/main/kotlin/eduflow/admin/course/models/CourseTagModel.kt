package eduflow.admin.course.models

import eduflow.course.CourseTag
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseTagModel(
    override val _id: String,
    override val name: String,
) : CourseTag
