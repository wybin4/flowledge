package flowledge.admin.course.models.course.version

import flowledge.course.course.version.CourseVersionSection
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseVersionSectionModel(
    override val _id: String,
    override val isVisible: Boolean? = null,
    override val lessons: List<CourseVersionLessonModel>? = null,
) : CourseVersionSection