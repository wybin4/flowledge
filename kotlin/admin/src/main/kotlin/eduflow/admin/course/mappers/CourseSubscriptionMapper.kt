package eduflow.admin.course.mappers

import eduflow.admin.course.dto.subscription.CourseSubscriptionGetByCourseIdResponse
import eduflow.admin.course.dto.subscription.CourseSubscriptionGetByUserIdResponse
import eduflow.admin.course.models.CourseModel
import eduflow.admin.course.models.CourseSubscriptionModel
import eduflow.admin.user.repositories.UserRepository
import org.mapstruct.Mapper
import org.mapstruct.Mapping

@Mapper(componentModel = "spring")
interface CourseSubscriptionMapper {

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

    @Mapping(target = "_id", source = "subscription._id")
    fun toSubscriptionWithUserDto(
        subscription: CourseSubscriptionModel,
        user: UserRepository.BaseUser,
    ): CourseSubscriptionGetByCourseIdResponse {
        return CourseSubscriptionGetByCourseIdResponse(
            _id = subscription._id,
            userId = subscription.userId,
            username = user.username,
            name = user.name,
        )
    }

}