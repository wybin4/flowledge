package eduflow.admin.course.services

import eduflow.admin.course.dto.section.SectionCreateRequest
import eduflow.admin.course.dto.section.SectionUpdateRequest
import eduflow.admin.course.dto.section.lessons.SectionGetLessonsItemResponse
import eduflow.admin.course.dto.section.lessons.SectionGetLessonsResponse
import eduflow.admin.course.models.CourseSectionModel
import eduflow.admin.course.models.course.CourseModel
import eduflow.admin.course.models.course.version.CourseVersionLessonModel
import eduflow.admin.course.models.course.version.CourseVersionSectionModel
import eduflow.admin.course.models.lesson.CourseLessonModel
import eduflow.admin.course.repositories.CourseSectionRepository
import eduflow.admin.course.repositories.lessons.CourseLessonRepository
import eduflow.admin.course.services.course.CourseVersionService
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class CourseSectionService(
    private val sectionRepository: CourseSectionRepository,
    private val lessonRepository: CourseLessonRepository,
    private val courseVersionService: CourseVersionService,
) {
    fun create(request: SectionCreateRequest): Mono<CourseSectionModel> {
        val newSection = CourseSectionModel.create(request.title)

        return sectionRepository.save(newSection)
            .flatMap { savedSection ->
                courseVersionService.getTargetVersion(request.courseId) { _, version ->
                    val updatedSections = version.sections?.toMutableList() ?: mutableListOf()
                    updatedSections.add(CourseVersionSectionModel(_id = savedSection._id))

                    courseVersionService.updateCurrentVersion(
                        courseId = request.courseId,
                        sections = updatedSections,
                        versionId = version._id,
                        versionName = version.name,
                        isMajor = true
                    )
                }
            }
            .then(Mono.just(newSection))
    }

    fun update(id: String, request: SectionUpdateRequest): Mono<ResponseEntity<CourseSectionModel>> {
        return sectionRepository.findById(id)
            .flatMap { existingSection: CourseSectionModel ->
                val updatedSection = existingSection.copy(
                    title = request.title ?: existingSection.title
                )

                if (request.isVisible != null) {
                    courseVersionService.getTargetVersion(courseId = request.courseId, versionId = null)
                    { course, version ->
                        val updatedSections = version.sections?.map { section ->
                            if (section._id == id) {
                                section.copy(isVisible = request.isVisible)
                            } else {
                                section
                            }
                        }

                        val createNew = course.isPublished == true
                        courseVersionService.updateCurrentVersion(
                            courseId = request.courseId,
                            sections = updatedSections,
                            versionId = if (createNew) version._id else null,
                            versionName = version.name,
                            isMajor = true
                        )
                    }
                        .then(sectionRepository.save(updatedSection))
                } else {
                    sectionRepository.save(updatedSection)
                }
            }
            .map { savedSection: CourseSectionModel -> ResponseEntity.ok(savedSection) }
            .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()))
    }

    fun delete(id: String, courseId: String): Mono<ResponseEntity<Void>> {
        return courseVersionService.getTargetVersion(courseId = courseId, versionId = null)
        { course, version ->
            val updatedSections = version.sections?.filter { it._id != id }

            val createNew = course.isPublished == true
            courseVersionService.updateCurrentVersion(
                courseId = courseId,
                sections = updatedSections,
                versionId = if (createNew) version._id else null,
                versionName = version.name,
                isMajor = true
            )
        }
            .then(Mono.just<ResponseEntity<Void>>(ResponseEntity.noContent().build()))
            .onErrorResume { _: Throwable -> Mono.just(ResponseEntity.notFound().build()) }
    }

    fun getLessonsBySectionId(
        sectionId: String,
        courseId: String,
        versionId: String?
    ): Mono<ResponseEntity<SectionGetLessonsResponse>> {
        return courseVersionService.getTargetVersionPair(
            courseId = courseId,
            versionId = versionId,
            callbackWithPair = { course, version ->
                Mono.just(course to version)
            }
        )
            .flatMap { (course, version) ->
                val sectionInVersion = version.sections?.find { it._id == sectionId }
                    ?: return@flatMap Mono.error(NoSuchElementException("Секция не найдена в указанной версии"))

                val lessonIds = sectionInVersion.lessons?.map { it._id } ?: emptyList()

                sectionRepository.findById(sectionId)
                    .zipWith(lessonRepository.findByIdIn(lessonIds).collectList())
                    .flatMap { tuple ->
                        val sectionFromRepo = tuple.t1
                        val lessonsFromRepo = tuple.t2

                        val visibleLessons = sectionInVersion.lessons
                            ?.filter { it.isVisible == true }
                            ?: emptyList()

                        val nextSectionId = findNextSectionId(sectionId, version.sections)
                        val nextSectionLesson = if (nextSectionId != null) {
                            version.sections.find { it._id == nextSectionId }?.lessons?.firstOrNull()
                        } else {
                            null
                        }

                        val response = mergeSectionData(
                            course = course,
                            sectionFromRepo = sectionFromRepo,
                            nextSectionLessonId = nextSectionLesson?._id,
                            lessonsFromVersion = visibleLessons,
                            lessonsFromRepo = lessonsFromRepo
                        )

                        Mono.just(ResponseEntity.ok(response))
                    }
            }
            .onErrorResume { _: Throwable -> Mono.just(ResponseEntity.notFound().build()) }
    }

    private fun mergeSectionData(
        course: CourseModel,
        sectionFromRepo: CourseSectionModel,
        nextSectionLessonId: String?,
        lessonsFromVersion: List<CourseVersionLessonModel>,
        lessonsFromRepo: List<CourseLessonModel>
    ): SectionGetLessonsResponse {
        val mergedLessons = lessonsFromVersion.map { lessonFromVersion ->
            val lessonFromRepo = lessonsFromRepo.find { it._id == lessonFromVersion._id }
            SectionGetLessonsItemResponse(
                _id = lessonFromVersion._id,
                title = lessonFromRepo?.title ?: "",
                videoId = lessonFromVersion.videoId,
                imageUrl = lessonFromRepo?.imageUrl,
                surveyId = lessonFromVersion.surveyId,
                hasSynopsis = (lessonFromRepo?.synopsisText)?.isNotEmpty(),
            )
        }

        return SectionGetLessonsResponse(
            title = sectionFromRepo.title,
            courseId = course._id,
            courseName = course.title,
            nextSectionLessonId = nextSectionLessonId,
            lessons = mergedLessons
        )
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
}