package eduflow.admin.course.dto.course.hub.get.id

import eduflow.admin.course.models.LessonModel
import eduflow.admin.course.types.SectionWithLessons

data class CourseHubGetByIdBigResponse(
    override val _id: String,
    override val title: String,
    override val imageUrl: String? = null,
    val sections: List<SectionWithLessons>,
    val lessons: List<LessonModel>,
): CourseHubGetByIdResponse
