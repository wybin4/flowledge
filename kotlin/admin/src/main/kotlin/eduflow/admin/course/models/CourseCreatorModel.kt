package flowledge.admin.course.models

import flowledge.admin.user.models.UserModel
import flowledge.course.CourseCreator
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseCreatorModel(
    override val _id: String,
    override val name: String,
    override val username: String,
) : CourseCreator {

    companion object {
        fun fromUser(user: UserModel): CourseCreatorModel {
            return CourseCreatorModel(
                _id = user._id,
                name = user.name,
                username = user.username
            )
        }
    }
}