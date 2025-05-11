package eduflow.admin.course.models

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
    override val tags: List<String>? = null
) : Course {
    fun updateTags(updatedTags: Map<String, List<String>>): CourseModel {
        return this.copy(tags = updatedTags[this._id] ?: emptyList())
    }
}
