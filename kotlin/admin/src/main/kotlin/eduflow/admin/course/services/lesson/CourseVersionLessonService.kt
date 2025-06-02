package flowledge.admin.course.services.lesson

import flowledge.admin.course.models.course.version.CourseVersionLessonModel
import flowledge.admin.course.models.course.version.CourseVersionModel
import flowledge.admin.course.models.course.version.CourseVersionSectionModel
import flowledge.admin.course.services.course.CourseVersionService
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class CourseVersionLessonService(private val versionService: CourseVersionService) {
    fun getLessonInVersion(version: CourseVersionModel, lessonId: String): Pair<CourseVersionLessonModel, String>? {
        return version.sections
            ?.flatMap { section ->
                section.lessons?.map { lesson ->
                    Pair(lesson, section._id)
                } ?: emptyList()
            }
            ?.find { it.first._id == lessonId }
    }

    fun updateSectionsWithLesson(
        version: CourseVersionModel,
        lessonId: String,
        updateLesson: (CourseVersionLessonModel) -> CourseVersionLessonModel
    ): List<CourseVersionSectionModel>? {
        return version.sections?.map { section ->
            section.lessons?.let { lessons ->
                if (lessons.any { it._id == lessonId }) {
                    val updatedLessons = lessons.map { lessonModel ->
                        if (lessonModel._id == lessonId) {
                            updateLesson(lessonModel)
                        } else {
                            lessonModel
                        }
                    }
                    section.copy(lessons = updatedLessons)
                } else {
                    section
                }
            } ?: section
        }
    }

    fun isLessonVisible(version: CourseVersionModel, lessonId: String): Boolean {
        return version.sections
            ?.flatMap { it.lessons ?: emptyList() }
            ?.find { it._id == lessonId }
            ?.isVisible == true
    }

    fun updateVersionWithSections(
        courseId: String,
        version: CourseVersionModel,
        updatedSections: List<CourseVersionSectionModel>?,
        createNew: Boolean = false
    ): Mono<Unit> {
        return versionService.updateCurrentVersion(
            courseId = courseId,
            sections = updatedSections,
            versionId = if (createNew) version._id else null,
            versionName = version.name,
            isMajor = false
        )
    }

}