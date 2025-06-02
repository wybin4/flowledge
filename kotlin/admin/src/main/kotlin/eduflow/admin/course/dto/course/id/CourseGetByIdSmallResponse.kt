package flowledge.admin.course.dto.course.id

import flowledge.course.CourseCreator
import java.util.*

data class CourseGetByIdSmallResponse(
    override val _id: String,
    override val title: String,
    override val imageUrl: String? = null,
    override val description: String,
    override val tags: List<String>?,
    val u: CourseCreator? = null,
    val createdAt: Date? = null,
    val isFavourite: Boolean? = null,
    val isPublished: Boolean? = null,
    override val versionName: String
) : CourseGetByIdResponse
