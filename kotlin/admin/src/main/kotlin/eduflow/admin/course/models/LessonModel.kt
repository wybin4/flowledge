package eduflow.admin.course.models

import eduflow.course.Section
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class SectionModel(
    override val _id: String,
    override val name: String,
    override val courseId: String,
) : Section
