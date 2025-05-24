package eduflow.course.course

import eduflow.course.CourseCreator
import java.util.*

interface Course {
    val _id: String
    val title: String
    val description: String
    val imageUrl: String?
    val u: CourseCreator
    val createdAt: Date
    val updatedAt: Date
    val tags: List<String>?
    val isPublished: Boolean?
    val versions: List<String>
}