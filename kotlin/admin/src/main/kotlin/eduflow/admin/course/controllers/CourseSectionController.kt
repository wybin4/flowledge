package eduflow.admin.course.controllers

import eduflow.admin.course.dto.section.SectionCreateRequest
import eduflow.admin.course.dto.section.SectionUpdateRequest
import eduflow.admin.course.dto.section.lessons.SectionGetLessonsItemResponse
import eduflow.admin.course.dto.section.lessons.SectionGetLessonsResponse
import eduflow.admin.course.models.CourseSectionModel
import eduflow.admin.course.repositories.CourseSectionRepository
import eduflow.admin.course.repositories.course.CourseRepository
import eduflow.admin.course.repositories.lessons.CourseLessonRepository
import eduflow.admin.course.repositories.lessons.survey.CourseLessonSurveyRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono
import java.util.*

@RestController
@RequestMapping("/api")
class CourseSectionController(
    private val sectionRepository: CourseSectionRepository,
    private val courseRepository: CourseRepository,
    private val lessonRepository: CourseLessonRepository,
    private val surveyRepository: CourseLessonSurveyRepository
) {

    @PostMapping("/courses-hub/sections.create")
    fun createSection(@RequestBody section: SectionCreateRequest): Mono<CourseSectionModel> {
        val newSection = CourseSectionModel(
            _id = UUID.randomUUID().toString(),
            title = section.title,
            courseId = section.courseId,
            isVisible = section.isVisible,
            createdAt = Date(),
            updatedAt = Date()
        )
        return sectionRepository.save(newSection)
    }

    @PostMapping("/courses-hub/sections.update/{id}")
    fun updateSectionTitle(
        @PathVariable id: String,
        @RequestBody request: SectionUpdateRequest
    ): Mono<ResponseEntity<CourseSectionModel>> {
        return sectionRepository.findById(id)
            .flatMap { existingSection: CourseSectionModel ->
                val updatedSection = existingSection.copy(
                    title = request.title ?: existingSection.title,
                    isVisible = request.isVisible ?: existingSection.isVisible
                )
                sectionRepository.save(updatedSection)
                    .map { savedSection: CourseSectionModel ->
                        ResponseEntity.ok(savedSection)
                    }
            }
            .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()))
    }

    @DeleteMapping("/courses-hub/sections.delete/{id}")
    fun deleteSection(
        @PathVariable id: String
    ): Mono<ResponseEntity<Void>> {
        return sectionRepository.deleteById(id)
            .then(Mono.just<ResponseEntity<Void>>(ResponseEntity.noContent().build()))
            .onErrorResume { _: Throwable ->
                Mono.just(ResponseEntity.notFound().build())
            }
    }

    @GetMapping("/courses-list/sections/{sectionId}.lessons")
    fun getLessonsBySectionId(
        @PathVariable sectionId: String
    ): Mono<ResponseEntity<SectionGetLessonsResponse>> {
        return sectionRepository.findById(sectionId)
            .flatMap { section ->
                courseRepository.findById(section.courseId)
                    .zipWith(lessonRepository.findBySectionIdAndIsVisible(sectionId, true).collectList())
                    .flatMap { tuple ->
                        val course = tuple.t1
                        val lessons = tuple.t2
                        val lessonIds = lessons.map { it._id }
                        surveyRepository.findByLessonIdIn(lessonIds).collectList()
                            .map { surveys ->
                                val lessonsWithSurveys = lessons.map { lesson ->
                                    val survey = surveys.find { it.lessonId == lesson._id }
                                    SectionGetLessonsItemResponse(
                                        _id = lesson._id,
                                        title = lesson.title,
                                        videoId = lesson.videoId,
                                        imageUrl = lesson.imageUrl,
                                        surveyId = survey?._id,
                                        hasSynopsis = lesson.synopsisText?.isNotEmpty(),
                                    )
                                }
                                SectionGetLessonsResponse(
                                    title = section.title,
                                    courseId = section.courseId,
                                    courseName = course.title,
                                    lessons = lessonsWithSurveys
                                )
                            }
                    }
            }
            .map { ResponseEntity.ok(it) }
            .defaultIfEmpty(ResponseEntity.notFound().build())
    }
}
