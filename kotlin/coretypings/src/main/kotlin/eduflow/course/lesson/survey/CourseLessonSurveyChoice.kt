package eduflow.course.lesson.survey

interface CourseLessonSurveyChoice {
    val _id: String
    val title: String
    val isCorrect: Boolean?
}