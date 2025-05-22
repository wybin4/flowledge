package eduflow.admin.course.models.progress

import eduflow.course.progress.CourseProgressLesson
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseProgressLessonModel(
    override val _id: String,
    override val progress: Int,
    override val isSurveyPassed: Boolean,
    override val synopsisProgress: Int,
    override val videoProgress: Int
) : CourseProgressLesson