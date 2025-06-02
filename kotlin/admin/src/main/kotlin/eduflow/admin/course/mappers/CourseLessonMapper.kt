package flowledge.admin.course.mappers

import flowledge.admin.course.dto.lesson.get.LessonGetHubResponse
import flowledge.admin.course.models.lesson.CourseLessonModel
import flowledge.admin.course.models.lesson.survey.CourseLessonSurveyModel
import org.mapstruct.Mapper
import org.mapstruct.Mapping

@Mapper(componentModel = "spring")
interface CourseLessonMapper {
    @Mapping(target = "_id", source = "lesson._id")
    @Mapping(target = "survey", source = "survey")
    fun toLessonGetHubResponse(
        lesson: CourseLessonModel,
        survey: CourseLessonSurveyModel?,
        isVisible: Boolean? = null,
        isDraft: Boolean? = null,
        videoId: String? = null,
    ): LessonGetHubResponse
}