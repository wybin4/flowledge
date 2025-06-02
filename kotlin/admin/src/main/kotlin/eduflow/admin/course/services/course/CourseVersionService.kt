package flowledge.admin.course.services.course

import flowledge.admin.course.models.course.CourseModel
import flowledge.admin.course.models.course.version.CourseVersionModel
import flowledge.admin.course.models.course.version.CourseVersionSectionModel
import flowledge.admin.course.repositories.course.CourseRepository
import flowledge.admin.course.repositories.course.version.CourseVersionRepository
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class CourseVersionService(
    private val courseRepository: CourseRepository,
    private val courseVersionRepository: CourseVersionRepository
) {
    private fun updateExistingVersion(
        versionId: String,
        updateSections: (List<CourseVersionSectionModel>) -> List<CourseVersionSectionModel>
    ): Mono<Void> {
        return courseVersionRepository.findById(versionId)
            .flatMap { versionToUpdate ->
                val updatedSections = updateSections(versionToUpdate.sections ?: emptyList())
                courseVersionRepository.save(versionToUpdate.copy(sections = updatedSections))
                    .then()
            }
    }

    private fun createNewVersion(
        courseId: String,
        versionName: String,
        isMajor: Boolean,
        updateSections: (List<CourseVersionSectionModel>) -> List<CourseVersionSectionModel>
    ): Mono<Void> {
        return courseRepository.findById(courseId)
            .flatMap { course ->
                val latestVersionId = course.versions.lastOrNull()
                    ?: return@flatMap Mono.error(IllegalStateException("Нет версий для обновления"))

                courseVersionRepository.findById(latestVersionId)
                    .flatMap { latestVersion ->
                        val updatedSections = updateSections(latestVersion.sections ?: emptyList())
                        val newVersion = CourseVersionModel.create(versionName, isMajor)
                        val updatedVersions = course.versions.toMutableList()
                        updatedVersions.add(newVersion._id)

                        courseVersionRepository.save(newVersion.copy(sections = updatedSections))
                            .then(courseRepository.save(course.copy(versions = updatedVersions)))
                            .then()
                    }
            }
    }

    fun updateCurrentVersion(
        courseId: String,
        sections: List<CourseVersionSectionModel>? = null,
        versionId: String? = null,
        versionName: String,
        isMajor: Boolean = false,
    ): Mono<Unit> {
        return if (versionId == null) {
            createNewVersion(courseId, versionName, isMajor) { sections ?: emptyList() }
        } else {
            updateExistingVersion(versionId) { sections ?: it }
        }.thenReturn(Unit)
    }

    private fun _getTargetVersion(
        courseId: String,
        versionId: String? = null,
        callback: ((CourseModel, CourseVersionModel) -> Mono<Unit>)? = null,
        callbackWithPair: ((CourseModel, CourseVersionModel) -> Mono<Pair<CourseModel, CourseVersionModel>>)? = null
    ): Mono<Pair<CourseModel, CourseVersionModel>> {
        return courseRepository.findById(courseId)
            .flatMap { course ->
                if (versionId == null) {
                    val latestVersionId = course.versions.lastOrNull()
                        ?: return@flatMap Mono.error(IllegalStateException("Нет версий для обновления"))
                    courseVersionRepository.findById(latestVersionId)
                } else {
                    versionId.let {
                        courseVersionRepository.findById(it)
                    }
                }
                    .flatMap { version ->
                        val callbackMono = callback?.invoke(course, version) ?: Mono.empty()
                        val callbackWithPairMono =
                            callbackWithPair?.invoke(course, version) ?: Mono.just(course to version)
                        callbackMono.then(callbackWithPairMono)
                    }
            }
    }

    fun getTargetVersion(
        courseId: String,
        versionId: String? = null,
        callback: (CourseModel, CourseVersionModel) -> Mono<Unit> = { _, _ -> Mono.empty() }
    ): Mono<CourseVersionModel> {
        return _getTargetVersion(
            courseId = courseId,
            versionId = versionId,
            callback = callback
        ).map { it.second }
    }

    fun getTargetVersionPair(
        courseId: String,
        versionId: String? = null,
        callbackWithPair: ((CourseModel, CourseVersionModel) -> Mono<Pair<CourseModel, CourseVersionModel>>)? = null
    ): Mono<Pair<CourseModel, CourseVersionModel>> {
        return _getTargetVersion(
            courseId = courseId,
            versionId = versionId,
            callbackWithPair = callbackWithPair
        )
    }
}