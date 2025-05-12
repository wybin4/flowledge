package eduflow.course

interface CourseSurveyQuestion {
    val _id: String
    val title: String
    val choices: List<CourseSurveyChoice>
}