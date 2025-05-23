package eduflow.admin.course.controllers

import eduflow.admin.course.dto.section.SectionCreateRequest
import eduflow.admin.course.dto.section.SectionUpdateRequest
import eduflow.admin.course.dto.section.lessons.SectionGetLessonsResponse
import eduflow.admin.course.models.CourseSectionModel
import eduflow.admin.course.repositories.CourseSectionRepository
import eduflow.admin.course.repositories.course.CourseRepository
import eduflow.admin.course.services.CourseSectionService
import eduflow.admin.course.services.course.CourseVersionService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api")
class CourseSectionController(
    private val sectionRepository: CourseSectionRepository,
    private val courseRepository: CourseRepository,
    private val courseVersionService: CourseVersionService,
    private val sectionService: CourseSectionService,
) {

    @PostMapping("/courses-hub/sections.create")
    fun createSection(@RequestBody section: SectionCreateRequest): Mono<CourseSectionModel> {
        val newSection = CourseSectionModel.create(
            title = section.title,
            courseId = section.courseId,
            isVisible = section.isVisible
        )

        return sectionRepository.save(newSection)
            .flatMap { savedSection ->
                courseVersionService.addSection(
                    savedSection.courseId, savedSection._id
                )
            }
            .then(Mono.just(newSection))
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

                if (request.isVisible != null && request.isVisible != existingSection.isVisible) {
                    courseVersionService
                        .copySections(existingSection.courseId)
                        .then(sectionRepository.save(updatedSection))
                } else {
                    sectionRepository.save(updatedSection)
                }
            }
            .map { savedSection: CourseSectionModel -> ResponseEntity.ok(savedSection) }
            .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()))
    }

    @DeleteMapping("/courses-hub/sections.delete/{id}")
    fun deleteSection(
        @PathVariable id: String
    ): Mono<ResponseEntity<Void>> {
        return sectionRepository.findById(id)
            .flatMap { section ->
                courseVersionService
                    .removeSection(section.courseId, id)
            }
            .then(Mono.just<ResponseEntity<Void>>(ResponseEntity.noContent().build()))
            .onErrorResume { _: Throwable -> Mono.just(ResponseEntity.notFound().build()) }
    }

    @GetMapping("/courses-list/sections/{sectionId}.lessons")
    fun getLessonsBySectionId(
        @PathVariable sectionId: String,
        @RequestParam(required = false) version: String?
    ): Mono<ResponseEntity<SectionGetLessonsResponse>> {
        return sectionRepository.findById(sectionId)
            .flatMap { section ->
                courseRepository.findById(section.courseId)
                    .flatMap { course ->
                        sectionService.getLessonsResponse(section, course, version)
                    }
            }
            .map { ResponseEntity.ok(it) }
            .defaultIfEmpty(ResponseEntity.notFound().build())
    }

}