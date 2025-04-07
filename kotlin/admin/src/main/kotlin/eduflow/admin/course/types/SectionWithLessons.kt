package eduflow.admin.course.types

import eduflow.admin.course.models.CourseLessonModel
import eduflow.admin.course.models.CourseSectionModel

data class SectionWithLessons (
    val section: CourseSectionModel,
    val lessons: List<CourseLessonModel>
)