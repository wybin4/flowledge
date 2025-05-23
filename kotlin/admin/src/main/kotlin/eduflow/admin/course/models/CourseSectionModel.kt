package eduflow.admin.course.models

import eduflow.admin.utils.generateId
import eduflow.course.CourseSection
import java.util.*

data class CourseSectionModel(
    override val _id: String,
    override val courseId: String,
    override val title: String,
    override val isVisible: Boolean,
    override val createdAt: Date,
    override val updatedAt: Date,
) : CourseSection {
    companion object {
        fun create(
            title: String,
            courseId: String,
            isVisible: Boolean = false
        ): CourseSectionModel {
            return CourseSectionModel(
                _id = generateId(),
                title = title,
                courseId = courseId,
                isVisible = isVisible,
                createdAt = Date(),
                updatedAt = Date()
            )
        }
    }
}