package flowledge.admin.course.dto.section.lessons

data class SectionGetLessonsItemResponse(
    val _id: String,
    val title: String,
    val imageUrl: String?,
    val videoId: String? = null,
    val surveyId: String? = null,
    val hasSynopsis: Boolean? = false,
)