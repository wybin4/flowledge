package eduflow.admin.course.types

import eduflow.admin.course.models.CourseSectionModel
import eduflow.admin.course.models.lesson.CourseLessonModel

data class SectionWithLessons(
    val section: CourseSectionModel,
    val lessons: List<CourseLessonModel>? = null
)