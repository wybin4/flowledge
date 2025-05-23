package eduflow.admin.course.models.course

import eduflow.admin.course.models.CourseCreatorModel
import eduflow.admin.user.models.UserModel
import eduflow.admin.utils.generateId
import eduflow.course.course.Course
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
    override val isPublished: Boolean? = null,
    override var versions: List<CourseVersionModel>
) : Course {
    fun getIsPublished(): Boolean? = isPublished

    fun getLatestVersionName(): String? {
        return versions.lastOrNull()?.name
    }

    fun getLatestVersion(): CourseVersionModel? {
        return versions.lastOrNull()
    }

    fun createNewVersion(isMajor: Boolean): CourseVersionModel {
        val latestVersion = getLatestVersion()
        val newVersionName = latestVersion?.let {
            val versionParts = it.name.split(".")
            if (isMajor) {
                "${versionParts[0].toInt() + 1}.0"
            } else {
                "${versionParts[0]}.${versionParts[1].toInt() + 1}"
            }
        } ?: "1.0"

        return CourseVersionModel(name = newVersionName)
    }

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
                versions = listOf(CourseVersionModel.create())
            )
        }
    }
}
