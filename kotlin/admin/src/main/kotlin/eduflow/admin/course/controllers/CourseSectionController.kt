package eduflow.admin.course.controllers

import eduflow.admin.course.dto.section.SectionCreateRequest
import eduflow.admin.course.dto.section.SectionUpdateRequest
import eduflow.admin.course.models.CourseSectionModel
import eduflow.admin.course.repositories.CourseSectionRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono
import java.util.*

@RestController
@RequestMapping("/api/courses-hub")
class CourseSectionController(
    private val sectionRepository: CourseSectionRepository,
) {

   @PostMapping("/sections.create")
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

    @PutMapping("/sections.update/{id}")
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

    @DeleteMapping("/sections.delete/{id}")
    fun deleteSection(
        @PathVariable id: String
    ): Mono<ResponseEntity<Void>> {
        return sectionRepository.deleteById(id)
            .then(Mono.just<ResponseEntity<Void>>(ResponseEntity.noContent().build()))
            .onErrorResume { _: Throwable -> 
                Mono.just(ResponseEntity.notFound().build()) 
            }
    }

}
