package eduflow.admin.course.models.lesson

import eduflow.admin.utils.generateId
import eduflow.course.lesson.CourseLesson
import org.springframework.data.mongodb.core.mapping.Document
import java.util.*

@Document
data class CourseLessonModel(
    override val _id: String,
    override var imageUrl: String? = null,
    override var time: String? = null,
    override var title: String,

    override val sectionId: String,

    override val isVisible: Boolean,
    override var isDraft: Boolean? = null,

    override var videoId: String? = null,
    override var surveyText: String? = null,
    override var synopsisText: String? = null,
    override val surveyId: String? = null,

    override val createdAt: Date,
    override val updatedAt: Date,
) : CourseLesson {
    fun getIsVisible(): Boolean = isVisible

    companion object {
        fun create(
            title: String,
            sectionId: String
        ): CourseLessonModel {
            return CourseLessonModel(
                _id = generateId(),
                title = title,
                sectionId = sectionId,
                isVisible = false,
                createdAt = Date(),
                updatedAt = Date(),
                isDraft = true,
            )
        }
    }
}
