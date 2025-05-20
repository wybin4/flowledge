package eduflow.admin.course.dto.section.lessons

data class SectionGetLessonsResponse(
    val title: String,
    val courseId: String,
    val courseName: String,
    val nextSectionLessonId: String? = null,
    val lessons: List<SectionGetLessonsItemResponse>
)