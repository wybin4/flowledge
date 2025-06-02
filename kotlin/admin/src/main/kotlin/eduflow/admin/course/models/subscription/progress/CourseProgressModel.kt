package flowledge.admin.course.models.subscription.progress

import flowledge.course.subscription.progress.CourseProgress
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseProgressModel(
    override val sections: List<CourseProgressSectionModel>,
    override val progress: Double? = null
) : CourseProgress