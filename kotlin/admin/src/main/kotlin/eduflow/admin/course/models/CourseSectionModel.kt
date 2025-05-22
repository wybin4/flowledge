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
    override var lessons: List<String>? = null,
    override val courseVersions: List<String>
) : CourseSection {
    companion object {
        fun create(
            _id: String?,
            title: String,
            courseId: String,
            isVisible: Boolean = false,
            courseVersions: List<String>
        ): CourseSectionModel {
            return CourseSectionModel(
                _id = _id ?: generateId(),
                title = title,
                courseId = courseId,
                isVisible = isVisible,
                createdAt = Date(),
                updatedAt = Date(),
                courseVersions = courseVersions
            )
        }
    }
}