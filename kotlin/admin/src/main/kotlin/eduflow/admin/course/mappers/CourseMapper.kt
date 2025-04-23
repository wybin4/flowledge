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
    fun toGetByIdBigDto(
        model: CourseModel,
        lessons: List<CourseLessonModel> = emptyList(),
        sections: List<SectionWithLessons> = emptyList(),
        subscription: CourseSubscriptionModel?
    ): CourseGetByIdBigResponse {
        return CourseGetByIdBigResponse(
            _id = model._id,
            title = model.title,
            imageUrl = model.imageUrl,
            description = model.description,
            lessons = lessons,
            sections = sections,
            isFavourite = subscription?.isFavourite ?: false,
        )
    }

    @Mapping(target = "_id", source = "model._id")
    fun toGetSmallDto(
        model: CourseModel,
        subscription: CourseSubscriptionModel?
    ): CourseGetByIdSmallResponse {
        return CourseGetByIdSmallResponse(
            _id = model._id,
            title = model.title,
            imageUrl = model.imageUrl,
            description = model.description,
            isFavourite = subscription?.isFavourite ?: false,
        )
    }

}