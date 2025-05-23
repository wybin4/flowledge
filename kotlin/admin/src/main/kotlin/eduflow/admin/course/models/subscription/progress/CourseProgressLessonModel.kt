package eduflow.admin.course.models.subscription.progress

import eduflow.course.subscription.progress.CourseProgressLesson
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseProgressLessonModel(
    override val _id: String,
    override val progress: Double,
    override val isSurveyPassed: Boolean? = null,
    override val synopsisProgress: Int? = null,
    override val videoProgress: Int? = null
) : CourseProgressLesson