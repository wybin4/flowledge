package eduflow.admin.course.models.progress

import eduflow.course.progress.CourseProgress
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseProgressModel(
    override val _id: String,
    override val courseId: String,
    override val courseVersion: String,
    override val sections: List<CourseProgressSectionModel>
) : CourseProgress