package flowledge.admin.course.models.course.version

import flowledge.course.course.version.CourseVersionLesson
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseVersionLessonModel(
    override val _id: String,

    override var isDraft: Boolean? = null,

    override val isVisible: Boolean? = null,
    override val hasSynopsis: Boolean? = null,
    override val surveyId: String? = null,
    override val videoId: String? = null,
) : CourseVersionLesson {
    companion object {
        fun create(_id: String): CourseVersionLessonModel {
            return CourseVersionLessonModel(
                _id = _id,
                isDraft = true,
                isVisible = false,
                hasSynopsis = false,
                surveyId = null,
                videoId = null
            )
        }
    }
}