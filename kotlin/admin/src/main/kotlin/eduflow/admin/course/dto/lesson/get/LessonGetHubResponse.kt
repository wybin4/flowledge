package flowledge.admin.course.dto.lesson.get

import flowledge.admin.course.models.lesson.survey.CourseLessonSurveyModel
import flowledge.course.lesson.CourseLesson
import java.util.*

data class LessonGetHubResponse(
    override val _id: String,
    override val time: String?,
    override val title: String,
    override val imageUrl: String?,

    val isDraft: Boolean?,
    val isVisible: Boolean?,

    override val synopsisText: String?,
    override val surveyText: String?,
    val survey: CourseLessonSurveyModel? = null,
    val videoId: String? = null,

    override val createdAt: Date,
    override val updatedAt: Date,
) : CourseLesson
