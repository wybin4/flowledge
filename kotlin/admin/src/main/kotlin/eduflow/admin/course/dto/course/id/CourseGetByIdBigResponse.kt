package eduflow.admin.course.dto.course.id

import eduflow.admin.course.dto.course.section.SectionWithLessonsResponse

data class CourseGetByIdBigResponse(
    override val _id: String,
    override val title: String,
    override val imageUrl: String? = null,
    override val description: String,
    override val tags: List<String>?,
    val sections: List<SectionWithLessonsResponse>,
    val versionId: String,
    override val versionName: String
) : CourseGetByIdResponse
