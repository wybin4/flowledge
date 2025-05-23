package eduflow.admin.course.models.course

import eduflow.course.course.CourseVersionSection
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseVersionSectionModel(
    override val _id: String,
    override val lessons: List<String>? = null
) : CourseVersionSection