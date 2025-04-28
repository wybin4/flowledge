package eduflow.admin.course.mappers

import eduflow.admin.course.dto.subscription.CourseSubscriptionGetResponse
import eduflow.admin.course.models.CourseModel
import eduflow.admin.course.models.CourseSubscriptionModel
import org.mapstruct.Mapper
import org.mapstruct.Mapping

@Mapper(componentModel = "spring")
interface CourseSubscriptionMapper {

    @Mapping(target = "_id", source = "course._id")
    fun toSubscriptionWithCourseDto(
        subscription: CourseSubscriptionModel,
        course: CourseModel,
    ): CourseSubscriptionGetResponse {
        return CourseSubscriptionGetResponse(
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