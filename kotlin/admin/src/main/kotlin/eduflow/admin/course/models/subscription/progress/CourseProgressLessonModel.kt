package flowledge.admin.course.models.subscription.progress

import flowledge.course.subscription.progress.CourseProgressLesson
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseProgressLessonModel(
    override val _id: String,
    override val progress: Double,
    override val isSurveyPassed: Boolean? = null,
    override val synopsisProgress: Double? = null,
    override val videoProgress: Double? = null
) : CourseProgressLesson