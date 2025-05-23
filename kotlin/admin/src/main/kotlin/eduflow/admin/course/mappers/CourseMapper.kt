package eduflow.admin.course.mappers

import eduflow.admin.course.dto.course.hub.id.CoursesHubGetByIdBigResponse
import eduflow.admin.course.dto.course.id.CourseGetByIdBigResponse
import eduflow.admin.course.dto.course.id.CourseGetByIdSmallResponse
import eduflow.admin.course.models.course.CourseModel
import eduflow.admin.course.types.CourseEditor
import eduflow.admin.course.types.SectionWithLessons
import org.mapstruct.Mapper
import org.mapstruct.Mapping

@Mapper(componentModel = "spring")
interface CourseMapper {
    @Mapping(target = "_id", source = "model._id")
    @Mapping(target = "sections", source = "sectionModels")
    fun toCoursesListGetByIdBigDto(
        model: CourseModel,
        sectionModels: List<SectionWithLessons> = emptyList()
    ): CourseGetByIdBigResponse {
        return CourseGetByIdBigResponse(
            _id = model._id,
            title = model.title,
            imageUrl = model.imageUrl,
            description = model.description,
            tags = model.tags,
            sections = sectionModels,
        )
    }

    @Mapping(target = "_id", source = "model._id")
    @Mapping(target = "sections", source = "sectionModels")
    @Mapping(
        target = "version",
        expression = "java(model.getLatestVersionName())"
    )
    fun toCoursesHubGetByIdBigDto(
        model: CourseModel,
        sectionModels: List<SectionWithLessons> = emptyList(),
        editors: List<CourseEditor> = emptyList()
    ): CoursesHubGetByIdBigResponse

    @Mapping(
        target = "u",
        expression = "java(isUser == false ? model.getU() : null)"
    )
    @Mapping(
        target = "createdAt",
        expression = "java(isUser == false ? model.getCreatedAt() : null)"
    )
    @Mapping(
        target = "version",
        expression = "java(model.getLatestVersionName())"
    )
    fun toGetSmallDto(model: CourseModel, isUser: Boolean?): CourseGetByIdSmallResponse

}