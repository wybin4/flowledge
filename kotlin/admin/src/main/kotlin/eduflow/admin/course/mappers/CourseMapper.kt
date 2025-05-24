package eduflow.admin.course.mappers

import eduflow.admin.course.dto.course.hub.id.CoursesHubGetByIdBigResponse
import eduflow.admin.course.dto.course.id.CourseGetByIdBigResponse
import eduflow.admin.course.dto.course.id.CourseGetByIdSmallResponse
import eduflow.admin.course.dto.course.section.SectionWithLessonsResponse
import eduflow.admin.course.models.course.CourseModel
import eduflow.admin.course.types.CourseEditor
import org.mapstruct.Mapper
import org.mapstruct.Mapping

@Mapper(componentModel = "spring")
interface CourseMapper {
    @Mapping(target = "_id", source = "model._id")
    @Mapping(target = "sections", source = "sectionModels")
    fun toCoursesListGetByIdBigDto(
        model: CourseModel,
        sectionModels: List<SectionWithLessonsResponse> = emptyList(),
        versionId: String,
        versionName: String
    ): CourseGetByIdBigResponse {
        return CourseGetByIdBigResponse(
            _id = model._id,
            title = model.title,
            imageUrl = model.imageUrl,
            description = model.description,
            tags = model.tags,
            sections = sectionModels,
            versionId = versionId,
            versionName = versionName,
        )
    }

    @Mapping(target = "_id", source = "model._id")
    @Mapping(target = "sections", source = "sectionModels")
    fun toCoursesHubGetByIdBigDto(
        model: CourseModel,
        sectionModels: List<SectionWithLessonsResponse> = emptyList(),
        editors: List<CourseEditor> = emptyList(),
        versionId: String,
        versionName: String
    ): CoursesHubGetByIdBigResponse

    @Mapping(
        target = "u",
        expression = "java(isUser == false ? model.getU() : null)"
    )
    @Mapping(
        target = "createdAt",
        expression = "java(isUser == false ? model.getCreatedAt() : null)"
    )
    fun toGetSmallDto(
        model: CourseModel,
        isUser: Boolean?,
        versionName: String,
    ): CourseGetByIdSmallResponse

}