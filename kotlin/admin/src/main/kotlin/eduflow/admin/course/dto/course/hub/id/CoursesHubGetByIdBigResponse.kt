package eduflow.admin.course.dto.course.hub.id

import eduflow.admin.course.dto.course.id.CourseGetByIdResponse
import eduflow.admin.course.dto.course.section.SectionWithLessonsResponse
import eduflow.admin.course.types.CourseEditor

data class CoursesHubGetByIdBigResponse(
    override val _id: String,
    override val title: String,
    override val imageUrl: String? = null,
    override val description: String,
    override val tags: List<String>?,
    val sections: List<SectionWithLessonsResponse>,
    val editors: List<CourseEditor>,
    val isPublished: Boolean? = null,
    val versionId: String,
    override val versionName: String
) : CourseGetByIdResponse
