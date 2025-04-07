package eduflow.admin.models

import eduflow.course.CourseCreator
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseCreatorModel(
    override val _id: String,
    override val name: String,
    override val username: String,
) : CourseCreator
