package eduflow.admin.course.dto.lesson.get

import eduflow.admin.course.models.lesson.survey.CourseLessonSurveyModel
import eduflow.course.lesson.CourseLesson
import java.util.*

data class LessonGetHubResponse(
    override val _id: String,
    override val createdAt: Date,
    override val imageUrl: String?,
    override val isDraft: Boolean?,
    override val isVisible: Boolean,
    override val sectionId: String,
    override val surveyText: String?,
    override val synopsisText: String?,
    val survey: CourseLessonSurveyModel? = null,
    override val time: String?,
    override val title: String,
    override val updatedAt: Date,
    override val videoId: String?,
    override val courseVersions: List<String>
) : CourseLesson
