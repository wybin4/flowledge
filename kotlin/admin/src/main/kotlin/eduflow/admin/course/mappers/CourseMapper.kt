package eduflow.admin.course.mappers

import eduflow.admin.course.dto.course.get.CourseGetByIdBigResponse
import eduflow.admin.course.dto.course.hub.get.CourseHubGetResponse
import eduflow.admin.course.dto.course.get.CourseGetByIdSmallResponse
import eduflow.admin.course.models.CourseLessonModel
import eduflow.admin.course.models.CourseSubscriptionModel
import eduflow.admin.course.models.CourseModel
import eduflow.admin.course.types.SectionWithLessons
import org.mapstruct.Mapper
import org.mapstruct.Mapping

@Mapper(componentModel = "spring")
interface CourseMapper {
    fun toHubGetDto(model: CourseModel): CourseHubGetResponse

    @Mapping(target = "_id", source = "model._id")
    @Mapping(
        target = "isFavourite",
        expression = "java(subscription != null ? subscription.isFavourite() : false)"
    )
    fun toGetByIdBigDto(
        model: CourseModel,
        lessons: List<CourseLessonModel> = emptyList(),
        sections: List<SectionWithLessons> = emptyList(),
        subscription: CourseSubscriptionModel? = null
    ): CourseGetByIdBigResponse {
        return CourseGetByIdBigResponse(
            _id = model._id,
            title = model.title,
            imageUrl = model.imageUrl,
            description = model.description,
            tags = model.tags,
            lessons = lessons,
            sections = sections,
            isFavourite = subscription?.isFavourite ?: false,
        )
    }

    @Mapping(target = "_id", source = "model._id")
    @Mapping(target = "title", source = "model.title")
    @Mapping(target = "imageUrl", source = "model.imageUrl")
    @Mapping(target = "description", source = "model.description")
    @Mapping(target = "tags", source = "model.tags")
    @Mapping(
        target = "u",
        expression = "java(subscription == null ? model.getU() : null)"
    )
    @Mapping(
        target = "createdAt",
        expression = "java(subscription == null ? model.getCreatedAt() : null)"
    )
    @Mapping(
        target = "isFavourite",
        expression = "java(subscription != null ? subscription.isFavourite() : false)"
    )
    fun toGetSmallDto(
        model: CourseModel,
        subscription: CourseSubscriptionModel? = null
    ): CourseGetByIdSmallResponse

}