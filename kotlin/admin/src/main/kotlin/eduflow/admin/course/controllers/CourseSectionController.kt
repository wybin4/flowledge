package flowledge.admin.course.controllers

import flowledge.admin.course.dto.section.SectionCreateRequest
import flowledge.admin.course.dto.section.SectionUpdateRequest
import flowledge.admin.course.dto.section.lessons.SectionGetLessonsResponse
import flowledge.admin.course.models.CourseSectionModel
import flowledge.admin.course.services.CourseSectionService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api")
class CourseSectionController(
    private val sectionService: CourseSectionService,
) {
    @PostMapping("/courses-hub/sections.create")
    fun createSection(@RequestBody section: SectionCreateRequest): Mono<CourseSectionModel> {
        return sectionService.create(section)
    }

    @PostMapping("/courses-hub/sections.update/{id}")
    fun updateSectionTitle(
        @PathVariable id: String,
        @RequestBody request: SectionUpdateRequest
    ): Mono<ResponseEntity<CourseSectionModel>> {
        return sectionService.update(id, request)
    }

    @DeleteMapping("/courses-hub/sections.delete/{id}")
    fun deleteSection(
        @PathVariable id: String,
        @RequestParam courseId: String
    ): Mono<ResponseEntity<Void>> {
        return sectionService.delete(id, courseId)
    }

    @GetMapping("/courses-list/sections/{sectionId}.lessons")
    fun getLessonsBySectionId(
        @PathVariable sectionId: String,
        @RequestParam courseId: String,
        @RequestParam(required = false) versionId: String?
    ): Mono<ResponseEntity<SectionGetLessonsResponse>> {
        return sectionService.getLessonsBySectionId(sectionId, courseId, versionId)
    }
}