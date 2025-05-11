package eduflow.admin.course.dto.lesson.create

data class LessonAddSynopsisAndStuffRequest(
    val _id: String,
    val synopsisText: String,
    val stuffList: List<Any>? = null,
) : LessonCreateRequest()