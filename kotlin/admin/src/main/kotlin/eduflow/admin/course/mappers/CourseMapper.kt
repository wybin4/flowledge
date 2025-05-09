package eduflow.admin.course.mappers

import eduflow.admin.course.dto.course.hub.get.CourseHubGetResponse
import eduflow.admin.course.dto.course.hub.id.CoursesHubGetByIdBigResponse
import eduflow.admin.course.dto.course.id.CourseGetByIdBigResponse
import eduflow.admin.course.dto.course.id.CourseGetByIdSmallResponse
import eduflow.admin.course.dto.subscription.CourseSubscriptionGetByUserIdResponse
import eduflow.admin.course.models.CourseLessonModel
import eduflow.admin.course.models.CourseModel
import eduflow.admin.course.models.CourseSubscriptionModel
import eduflow.admin.course.types.CourseEditor
import eduflow.admin.course.types.SectionWithLessons
import org.mapstruct.Mapper
import org.mapstruct.Mapping

@Mapper(componentModel = "spring")
interface CourseMapper {
    fun toHubGetDto(model: CourseModel): CourseHubGetResponse

    @Mapping(target = "_id", source = "model._id")
    fun toCoursesListGetByIdBigDto(
        model: CourseModel,
        lessons: List<CourseLessonModel> = emptyList(),
        sections: List<SectionWithLessons> = emptyList()
    ): CourseGetByIdBigResponse {
        return CourseGetByIdBigResponse(
            _id = model._id,
            title = model.title,
            imageUrl = model.imageUrl,
            description = model.description,
            tags = model.tags,
            lessons = lessons,
            sections = sections,
        )
    }

    @Mapping(target = "_id", source = "model._id")
    fun toCoursesHubGetByIdBigDto(
        model: CourseModel,
        lessons: List<CourseLessonModel> = emptyList(),
        sections: List<SectionWithLessons> = emptyList(),
        editors: List<CourseEditor> = emptyList()
    ): CoursesHubGetByIdBigResponse {
        return CoursesHubGetByIdBigResponse(
            _id = model._id,
            title = model.title,
            imageUrl = model.imageUrl,
            description = model.description,
            tags = model.tags,
            lessons = lessons,
            sections = sections,
            editors = editors
        )
    }

    @Mapping(target = "_id", source = "model._id")
    @Mapping(target = "title", source = "model.title")
    @Mapping(target = "imageUrl", source = "model.imageUrl")
    @Mapping(target = "description", source = "model.description")
    @Mapping(target = "tags", source = "model.tags")
    @Mapping(
        target = "u",
        expression = "java(isUser == false ? model.getU() : null)"
    )
    @Mapping(
        target = "createdAt",
        expression = "java(isUser == false ? model.getCreatedAt() : null)"
    )
    fun toGetSmallDto(model: CourseModel, isUser: Boolean?): CourseGetByIdSmallResponse

    @Mapping(target = "_id", source = "course._id")
    fun toSubscriptionWithCourseDto(
        subscription: CourseSubscriptionModel,
        course: CourseModel,
    ): CourseSubscriptionGetByUserIdResponse {
        return CourseSubscriptionGetByUserIdResponse(
            _id = course._id,
            courseId = subscription.courseId,
            isFavourite = subscription.isFavourite,
            isSubscribed = subscription.isSubscribed,
            roles = subscription.roles,
            userId = subscription.userId,
            title = course.title,
            imageUrl = course.imageUrl,
            description = course.description,
            tags = course.tags
        )
    }

}