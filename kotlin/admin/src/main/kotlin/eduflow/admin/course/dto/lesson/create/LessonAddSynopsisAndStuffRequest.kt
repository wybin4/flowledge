package flowledge.admin.course.dto.lesson.create

data class LessonAddSynopsisAndStuffRequest(
    override val _id: String,
    val synopsisText: String,
    val stuffList: List<Any>? = null,
    override val courseId: String,
) : LessonCreateRequest(courseId), LessonCreateIdentifiableRequest