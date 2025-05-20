package eduflow.admin.course.models

import eduflow.course.CourseSection
import java.util.*

data class CourseSectionModel(
    override val _id: String,
    override val courseId: String,
    override val title: String,
    override val isVisible: Boolean,
    override val createdAt: Date,
    override val updatedAt: Date,
    override var lessons: List<String>? = null
) : CourseSection