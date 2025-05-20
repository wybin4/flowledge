package eduflow.admin.course.dto.course.hub.id

import eduflow.admin.course.dto.course.id.CourseGetByIdResponse
import eduflow.admin.course.types.CourseEditor
import eduflow.admin.course.types.SectionWithLessons

data class CoursesHubGetByIdBigResponse(
    override val _id: String,
    override val title: String,
    override val imageUrl: String? = null,
    override val description: String,
    override val tags: List<String>?,
    val sections: List<SectionWithLessons>,
    val editors: List<CourseEditor>
) : CourseGetByIdResponse
