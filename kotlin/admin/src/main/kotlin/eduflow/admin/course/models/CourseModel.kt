package eduflow.admin.course.models

import eduflow.admin.user.models.UserModel
import eduflow.admin.utils.generateId
import eduflow.course.Course
import org.springframework.data.mongodb.core.mapping.Document
import java.util.*

@Document
data class CourseModel(
    override val _id: String,
    override val title: String,
    override val description: String,
    override val imageUrl: String? = null,
    override val u: CourseCreatorModel,
    override val createdAt: Date,
    override val updatedAt: Date,
    override val tags: List<String>? = null,
    override var sections: List<String>? = null,
    override val isPublished: Boolean? = null,
    override val versions: List<String>?
) : Course {
    fun updateTags(updatedTags: Map<String, List<String>>): CourseModel {
        return this.copy(tags = updatedTags[this._id] ?: emptyList())
    }

    companion object {
        fun create(
            title: String,
            description: String,
            user: UserModel,
            imageUrl: String? = null,
        ): CourseModel {
            return CourseModel(
                _id = generateId(),
                title = title,
                description = description,
                imageUrl = imageUrl,
                createdAt = Date(),
                updatedAt = Date(),
                u = CourseCreatorModel.fromUser(user),
                isPublished = null,
                versions = listOf("0.1")
            )
        }
    }
}
