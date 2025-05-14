package eduflow.course.lesson.survey

interface CourseLessonSurvey {
    val _id: String
    val lessonId: String
    val questions: List<CourseLessonSurveyQuestion>
}