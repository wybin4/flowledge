package flowledge.admin.course.dto.survey

data class SurveyAttemptCreateRequest(
    val surveyId: String,
    val userChoices: List<String>
)
