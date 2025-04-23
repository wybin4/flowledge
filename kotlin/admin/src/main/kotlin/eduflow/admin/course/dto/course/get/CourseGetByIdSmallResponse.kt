package eduflow.admin.course.dto.course.get

data class CourseGetByIdSmallResponse(
    override val _id: String,
    override val title: String,
    override val imageUrl: String? = null,
    override val description: String,
    val isFavourite: Boolean? = null
): CourseGetByIdResponse
