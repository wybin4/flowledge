package flowledge.admin.course.models.subscription.progress

import flowledge.course.subscription.progress.CourseProgressSection
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseProgressSectionModel(
    override val _id: String,
    override val lessons: List<CourseProgressLessonModel>,
    override val progress: Double
) : CourseProgressSection