package eduflow.admin.course.dto.course.hub.get.id

data class CourseHubGetByIdSmallResponse(
    override val _id: String,
    override val title: String,
    override val imageUrl: String? = null,
    val description: String? = null,
): CourseHubGetByIdResponse
