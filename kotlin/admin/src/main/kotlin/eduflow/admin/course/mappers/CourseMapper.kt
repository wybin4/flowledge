package eduflow.admin.course.mappers

import eduflow.admin.course.dto.course.CourseListGetResponse
import eduflow.admin.course.dto.course.hub.get.CourseHubGetResponse
import eduflow.admin.course.dto.course.hub.get.id.CourseHubGetByIdBigResponse
import eduflow.admin.course.dto.course.hub.get.id.CourseHubGetByIdSmallResponse
import eduflow.admin.course.models.CourseModel
import eduflow.admin.course.models.CourseSubscriptionModel
import eduflow.admin.course.models.LessonModel
import eduflow.admin.course.types.SectionWithLessons
import org.mapstruct.Mapper
import org.mapstruct.Mapping

@Mapper(componentModel = "spring")
interface CourseMapper {
    fun toHubGetDto(model: CourseModel): CourseHubGetResponse

    @Mapping(target = "lessons", source = "lessons")
    @Mapping(target = "sections", source = "sections")
    fun toHubGetByIdBigDto(
        model: CourseModel,
        lessons: List<LessonModel> = emptyList(),
        sections: List<SectionWithLessons> = emptyList()
    ): CourseHubGetByIdBigResponse {
        return CourseHubGetByIdBigResponse(
            _id = model._id,
            title = model.title,
            imageUrl = model.imageUrl,
            lessons = lessons,
            sections = sections,
        )
    }

    fun toHubGetByIdSmallDto(model: CourseModel): CourseHubGetByIdSmallResponse

    @Mapping(target = "_id", source = "model._id")
    @Mapping(
        target = "isFavorite",
        expression = "java( (subscription != null) ? subscription.isFavorite() : false )"
    )
    fun toListGetDto(model: CourseModel, subscription: CourseSubscriptionModel?): CourseListGetResponse
}