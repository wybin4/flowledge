package eduflow.admin.course.models

import eduflow.course.CourseLesson
import org.springframework.data.mongodb.core.mapping.Document
import java.util.*

@Document
data class CourseLessonModel(
    override val _id: String,
    override var imageUrl: String? = null,
    override var time: String? = null,
    override var title: String,
    override val courseId: String? = null,
    override val sectionId: String? = null,
    override val isVisible: Boolean,
    override val videoId: String? = null,
    override val createdAt: Date,
    override val updatedAt: Date,
    override val surveyText: String? = null,
    override val synopsis: String? = null,
    override var isDraft: Boolean? = null,
) : CourseLesson
