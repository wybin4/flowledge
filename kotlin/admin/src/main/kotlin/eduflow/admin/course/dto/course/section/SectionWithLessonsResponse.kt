package flowledge.admin.course.dto.course.section

data class SectionWithLessonsResponse(
    val section: CourseGetSectionResponse,
    val lessons: List<CourseGetLessonResponse>? = null
)