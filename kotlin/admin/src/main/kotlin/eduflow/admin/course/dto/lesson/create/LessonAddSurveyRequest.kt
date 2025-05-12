package eduflow.admin.course.dto.lesson.create

data class LessonAddSurveyRequest(
    val _id: String,
    val questions: List<LessonAddSurveyQuestionRequest>,
) : LessonCreateRequest()