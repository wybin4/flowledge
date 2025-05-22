package eduflow.admin.course.mappers

import eduflow.admin.course.dto.lesson.get.LessonGetHubResponse
import eduflow.admin.course.models.lesson.CourseLessonModel
import eduflow.admin.course.models.lesson.survey.CourseLessonSurveyModel
import org.mapstruct.Mapper
import org.mapstruct.Mapping

@Mapper(componentModel = "spring")
interface CourseLessonMapper {
    @Mapping(target = "_id", source = "lesson._id")
    @Mapping(target = "survey", source = "survey")
    @Mapping(target = "courseVersions", source = "lesson.courseVersions")
    fun toLessonGetHubResponse(lesson: CourseLessonModel, survey: CourseLessonSurveyModel?): LessonGetHubResponse
}