package eduflow.admin.course.controllers

import eduflow.admin.course.dto.section.SectionCreateRequest
import eduflow.admin.course.models.SectionModel
import eduflow.admin.course.repositories.SectionRepository
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono
import java.util.*

@RestController
@RequestMapping("/api/courses-hub")
class SectionController(
    private val sectionRepository: SectionRepository,
) {

   @PostMapping("/sections.create")
    fun createSection(@RequestBody section: SectionCreateRequest): Mono<SectionModel> {
        val newSection = SectionModel(
            _id = UUID.randomUUID().toString(),
            name = section.name,
            courseId = section.courseId,
        )
        return sectionRepository.save(newSection)
    }

}
