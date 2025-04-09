package eduflow.admin.course.models

import eduflow.course.CourseLesson
import org.springframework.data.mongodb.core.mapping.Document
import java.util.*

@Document
data class CourseLessonModel(
    override val _id: String,
    override val imageUrl: String?,
    override val time: String,
    override val title: String,
    override val courseId: String?,
    override val sectionId: String?,
    override val isVisible: Boolean,
    override val videoId: String?,
    override val createdAt: Date,
    override val updatedAt: Date,
) : CourseLesson
