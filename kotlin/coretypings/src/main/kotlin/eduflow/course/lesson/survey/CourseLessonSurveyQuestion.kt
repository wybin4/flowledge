package flowledge.course.lesson.survey

interface CourseLessonSurveyQuestion {
    val _id: String
    val title: String
    val choices: List<CourseLessonSurveyChoice>
}