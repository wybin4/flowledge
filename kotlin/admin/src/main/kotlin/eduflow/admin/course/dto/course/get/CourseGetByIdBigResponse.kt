package eduflow.admin.course.dto.course.get

import eduflow.admin.course.models.CourseLessonModel
import eduflow.admin.course.types.SectionWithLessons

data class CourseGetByIdBigResponse(
    override val _id: String,
    override val title: String,
    override val imageUrl: String? = null,
    override val description: String,
    override val tags: List<String>?,
    val sections: List<SectionWithLessons>,
    val lessons: List<CourseLessonModel>,
    val isFavourite: Boolean? = null
): CourseGetByIdResponse
