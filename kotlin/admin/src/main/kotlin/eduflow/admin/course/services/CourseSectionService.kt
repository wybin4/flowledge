package eduflow.admin.course.services

import eduflow.admin.course.dto.section.lessons.SectionGetLessonsItemResponse
import eduflow.admin.course.dto.section.lessons.SectionGetLessonsResponse
import eduflow.admin.course.models.CourseSectionModel
import eduflow.admin.course.models.course.CourseModel
import eduflow.admin.course.models.course.CourseVersionSectionModel
import eduflow.admin.course.models.lesson.CourseLessonModel
import eduflow.admin.course.services.lesson.CourseLessonService
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class CourseSectionService(private val lessonService: CourseLessonService) {
    fun getLessonsResponse(
        section: CourseSectionModel,
        course: CourseModel,
        version: String? = "latest"
    ): Mono<SectionGetLessonsResponse> {
        val targetVersion = if (version == "latest") {
            course.versions.lastOrNull()
        } else {
            course.versions.find { it.name == version }
        }

        return if (targetVersion != null) {
            val sectionInVersion = targetVersion.sections?.find { it._id == section._id }
            if (sectionInVersion != null) {
                val lessonIds = sectionInVersion.lessons ?: emptyList()
                lessonService.getVisibleLessonsByIds(lessonIds)
                    .flatMap { visibleLessons ->
                        val nextSectionId = findNextSectionId(section._id, targetVersion.sections)
                        val nextSectionLessonId = if (nextSectionId != null) {
                            targetVersion.sections.find { it._id == nextSectionId }?.lessons?.firstOrNull()
                        } else {
                            null
                        }

                        Mono.just(
                            createSectionGetLessonsResponse(
                                section = section,
                                course = course,
                                lessons = visibleLessons,
                                nextSectionLessonId = nextSectionLessonId
                            )
                        )
                    }
            } else {
                Mono.error(NoSuchElementException("Секция не найдена в указанной версии"))
            }
        } else {
            Mono.error(NoSuchElementException("Версия не найдена"))
        }
    }

    private fun findNextSectionId(
        currentSectionId: String,
        sections: List<CourseVersionSectionModel>?
    ): String? {
        return if (!sections.isNullOrEmpty()) {
            val currentSectionIndex = sections.indexOfFirst { it._id == currentSectionId }
            if (currentSectionIndex != -1 && currentSectionIndex < sections.size - 1) {
                sections[currentSectionIndex + 1]._id
            } else {
                null
            }
        } else {
            null
        }
    }

    private fun createSectionGetLessonsResponse(
        section: CourseSectionModel,
        course: CourseModel,
        lessons: List<CourseLessonModel>,
        nextSectionLessonId: String?
    ): SectionGetLessonsResponse {
        return SectionGetLessonsResponse(
            title = section.title,
            courseId = section.courseId,
            courseName = course.title,
            nextSectionLessonId = nextSectionLessonId,
            lessons = lessons.map { lesson ->
                SectionGetLessonsItemResponse(
                    _id = lesson._id,
                    title = lesson.title,
                    videoId = lesson.videoId,
                    imageUrl = lesson.imageUrl,
                    surveyId = lesson.surveyId,
                    hasSynopsis = lesson.synopsisText?.isNotEmpty(),
                )
            }
        )
    }
}