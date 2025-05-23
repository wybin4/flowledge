package eduflow.admin.course.mappers

import eduflow.admin.course.dto.subscription.CourseSubscriptionGetByCourseIdResponse
import eduflow.admin.course.dto.subscription.CourseSubscriptionGetByUserIdResponse
import eduflow.admin.course.models.CourseCreatorModel
import eduflow.admin.course.models.course.CourseModel
import eduflow.admin.course.models.subscription.CourseSubscriptionModel
import eduflow.admin.user.models.UserModel
import org.mapstruct.Mapper
import org.mapstruct.Mapping

@Mapper(componentModel = "spring")
interface CourseSubscriptionMapper {

    @Mapping(target = "_id", source = "course._id")
    @Mapping(target = "createdAt", source = "course.createdAt")
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
            tags = course.tags,
            u = CourseCreatorModel(
                _id = course.u._id,
                name = course.u.name,
                username = course.u.username,
            ),
            createdAt = course.createdAt,
            courseVersion = subscription.courseVersion,
            progress = subscription.progress,
        )
    }

    @Mapping(target = "_id", source = "subscription._id")
    fun toSubscriptionWithUserDto(
        subscription: CourseSubscriptionModel,
        user: UserModel.BaseUser,
    ): CourseSubscriptionGetByCourseIdResponse {
        return CourseSubscriptionGetByCourseIdResponse(
            _id = subscription._id,
            userId = subscription.userId,
            username = user.username,
            name = user.name,
        )
    }

}