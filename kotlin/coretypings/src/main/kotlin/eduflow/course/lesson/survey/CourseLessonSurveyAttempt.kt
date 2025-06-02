package flowledge.course.lesson.survey

import java.util.*

interface CourseLessonSurveyAttempt {
    val _id: String
    val surveyId: String
    val userId: String
    val completedAt: Date
    val score: Int
    val answers: List<CourseLessonSurveyAnswer>
}