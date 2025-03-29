package eduflow.course

import java.util.Date

interface Course {
    val _id: String
    val title: String
    val description: String
    val u: CourseCreator
    val createdAt: Date
    val updatedAt: Date
}