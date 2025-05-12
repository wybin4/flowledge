package eduflow.admin.course.dto.lesson

import eduflow.admin.course.models.survey.CourseSurveyModel
import eduflow.course.CourseLesson
import java.util.*

data class LessonGetResponse(
    override val _id: String,
    override val courseId: String?,
    override val createdAt: Date,
    override val imageUrl: String?,
    override val isDraft: Boolean?,
    override val isVisible: Boolean,
    override val sectionId: String?,
    override val surveyText: String?,
    override val synopsisText: String?,
    val survey: CourseSurveyModel? = null,
    override val time: String?,
    override val title: String,
    override val updatedAt: Date,
    override val videoId: String?
) : CourseLesson
