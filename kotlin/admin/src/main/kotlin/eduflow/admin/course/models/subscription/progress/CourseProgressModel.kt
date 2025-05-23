package eduflow.admin.course.models.subscription.progress

import eduflow.course.subscription.progress.CourseProgress
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseProgressModel(
    override val sections: List<CourseProgressSectionModel>
) : CourseProgress