package flowledge.admin.course.dto.course.section

import flowledge.course.course.version.CourseVersionLesson

data class CourseGetLessonResponse(
    override val _id: String,
    val title: String,
    val time: String?,
    val imageUrl: String?,

    override val isVisible: Boolean?,

    override val hasSynopsis: Boolean?,
    override val isDraft: Boolean?,

    override val surveyId: String?,
    override val videoId: String?
) : CourseVersionLesson