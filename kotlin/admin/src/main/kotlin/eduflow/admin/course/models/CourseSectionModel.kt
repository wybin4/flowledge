package eduflow.admin.course.models

import eduflow.course.CourseSection

data class CourseSectionModel (
    override val _id: String,
    override val courseId: String,
    override val title: String
): CourseSection