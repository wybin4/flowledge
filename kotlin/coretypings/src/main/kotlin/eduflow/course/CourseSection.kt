package eduflow.course

import java.util.*

interface CourseSection {
    val _id: String
    val title: String
    val courseId: String
    val isVisible: Boolean
    val createdAt: Date
    val updatedAt: Date
    val lessons: List<String>?
    val courseVersions: List<String>
}