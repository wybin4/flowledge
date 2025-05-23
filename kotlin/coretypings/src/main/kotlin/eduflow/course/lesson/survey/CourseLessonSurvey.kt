package eduflow.course.lesson.survey

interface CourseLessonSurvey {
    val _id: String
    val questions: List<CourseLessonSurveyQuestion>
    val passThreshold: Int
    val maxAttempts: Int
}