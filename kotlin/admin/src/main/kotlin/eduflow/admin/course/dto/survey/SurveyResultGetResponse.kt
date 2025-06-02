package flowledge.admin.course.dto.survey

data class SurveyResultGetResponse(
    val passThreshold: Int,
    val bestResult: Int,
    val currentResult: Int? = null,
    val maxAttempts: Int,
    val userAttempts: Int
)
