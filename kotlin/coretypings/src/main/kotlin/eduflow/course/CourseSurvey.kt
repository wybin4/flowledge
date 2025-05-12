package eduflow.course

interface CourseSurvey {
    val _id: String
    val lessonId: String
    val questions: List<CourseSurveyQuestion>
}