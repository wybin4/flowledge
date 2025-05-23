package eduflow.admin.course.models.course

import eduflow.course.course.CourseVersion
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class CourseVersionModel(
    override val name: String,
    override val sections: List<CourseVersionSectionModel>? = null
) : CourseVersion {
    companion object {
        fun create(): CourseVersionModel {
            return CourseVersionModel(
                name = "0.1"
            )
        }
    }
}