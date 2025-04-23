package eduflow.admin.course.dto.course.list

data class ToggleFavouriteRequest(
    val userId: String,
    val isFavourite: Boolean
)
