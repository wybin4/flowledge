package flowledge.admin.course.dto.survey

import flowledge.admin.course.models.lesson.survey.CourseLessonSurveyModel

data class SurveyGetByIdResponse(
    val survey: CourseLessonSurveyModel,
    val result: SurveyResultGetResponse? = null
)
