package eduflow.admin.course.models

import eduflow.admin.utils.generateId
import eduflow.course.CourseSection
import java.util.*

data class CourseSectionModel(
    override val _id: String,
    override val title: String,
    override val createdAt: Date,
    override val updatedAt: Date,
) : CourseSection {
    companion object {
        fun create(title: String?): CourseSectionModel {
            return CourseSectionModel(
                _id = generateId(),
                title = title ?: "",
                createdAt = Date(),
                updatedAt = Date()
            )
        }
    }
}