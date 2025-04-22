package eduflow.admin.course.models

import eduflow.course.Course
import eduflow.course.CourseCreator
import org.springframework.data.mongodb.core.mapping.Document
import java.util.*

@Document
data class CourseModel(
    override val _id: String,
    override val title: String,
    override val description: String,
    override val imageUrl: String? = null,
    override val u: CourseCreator,
    override val createdAt: Date,
    override val updatedAt: Date,
    override var isFavourite: Boolean? = null
) : Course
