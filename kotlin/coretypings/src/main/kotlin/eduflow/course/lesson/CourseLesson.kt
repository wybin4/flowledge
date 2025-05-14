package eduflow.course.lesson

import java.util.*

interface CourseLesson {
    val _id: String
    val title: String
    val time: String?
    val imageUrl: String?
    val sectionId: String?
    val courseId: String?
    val isVisible: Boolean
    val isDraft: Boolean?
    val videoId: String?
    val synopsisText: String?
    val surveyText: String?
    val createdAt: Date
    val updatedAt: Date
}