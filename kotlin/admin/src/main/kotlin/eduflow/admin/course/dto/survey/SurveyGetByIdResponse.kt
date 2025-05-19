package eduflow.admin.course.dto.survey

import eduflow.admin.course.models.lesson.survey.CourseLessonSurveyModel

data class SurveyGetByIdResponse(
    val survey: CourseLessonSurveyModel,
    val result: SurveyResultGetResponse? = null
)
