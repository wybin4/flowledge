package flowledge.admin.course.models.course.version

import flowledge.admin.utils.generateId
import flowledge.course.course.version.CourseVersion
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseVersionModel(
    override val _id: String,
    override val name: String,
    override val sections: List<CourseVersionSectionModel>? = null,
) : CourseVersion {
    companion object {
        fun create(latestName: String? = null, isMajor: Boolean): CourseVersionModel {
            val newVersionName = latestName?.let {
                val versionParts = it.split(".")
                if (isMajor) {
                    "${versionParts[0].toInt() + 1}.0"
                } else {
                    "${versionParts[0]}.${versionParts[1].toInt() + 1}"
                }
            } ?: "0.1"

            return CourseVersionModel(
                _id = generateId(),
                name = newVersionName
            )
        }
    }
}