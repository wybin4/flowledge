package eduflow.admin.course.services.course

import eduflow.admin.course.models.course.CourseModel
import eduflow.admin.course.models.course.CourseVersionModel
import eduflow.admin.course.models.course.CourseVersionSectionModel
import eduflow.admin.course.repositories.course.CourseRepository
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class CourseVersionService(private val courseRepository: CourseRepository) {

    private fun updateVersion(
        courseId: String,
        isMajor: Boolean,
        updateSections: (List<CourseVersionSectionModel>) -> List<CourseVersionSectionModel>
    ): Mono<Void> {
        return courseRepository.findById(courseId)
            .flatMap { course ->
                val latestVersion = course.getLatestVersion()
                if (latestVersion != null) {
                    val updatedSections = updateSections(latestVersion.sections ?: emptyList())

                    val newVersion = course.createNewVersion(isMajor = isMajor)
                    val updatedVersions = course.versions.toMutableList()
                    updatedVersions.add(newVersion.copy(sections = updatedSections))

                    course.versions = updatedVersions
                    courseRepository.save(course).then()
                } else {
                    Mono.error(IllegalStateException("Нет версий для обновления"))
                }
            }
    }

    fun removeSection(courseId: String, sectionId: String): Mono<Void> {
        return updateVersion(courseId, isMajor = true) { sections ->
            sections.filterNot { it._id == sectionId }
        }
    }

    fun addSection(courseId: String, sectionId: String): Mono<CourseModel> {
        return updateVersion(courseId, isMajor = true) { sections ->
            sections + CourseVersionSectionModel(_id = sectionId)
        }.then(courseRepository.findById(courseId))
    }

    fun removeLessonFromSection(courseId: String, sectionId: String, lessonId: String): Mono<Void> {
        return updateVersion(courseId, isMajor = false) { sections ->
            sections.map { section ->
                if (section._id == sectionId) {
                    section.copy(lessons = section.lessons?.filterNot { it == lessonId })
                } else {
                    section
                }
            }
        }
    }

    fun addLessonToSection(
        courseId: String,
        sectionId: String,
        updateSection: (CourseVersionSectionModel) -> CourseVersionSectionModel
    ): Mono<Void> {
        return updateVersion(courseId, isMajor = false) { sections ->
            sections.map { section ->
                if (section._id == sectionId) {
                    updateSection(section)
                } else {
                    section
                }
            }
        }
    }

    fun copySections(courseId: String): Mono<Void> {
        return updateVersion(courseId, isMajor = true) { sections ->
            sections
        }
    }

    fun getTargetVersion(course: CourseModel, version: String): CourseVersionModel? {
        return if (version == "latest") {
            course.versions.lastOrNull()
        } else {
            course.versions.find { it.name == version }
        }
    }

    fun copyLessons(courseId: String, lessonId: String): Mono<Void> {
        return updateVersion(courseId, isMajor = false) { sections ->
            sections.map { section ->
                if (section.lessons?.contains(lessonId) == true) {
                    section.copy(lessons = section.lessons)
                } else {
                    section
                }
            }
        }
    }
}