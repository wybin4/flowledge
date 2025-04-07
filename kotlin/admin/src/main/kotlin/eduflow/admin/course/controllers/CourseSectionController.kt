package eduflow.admin.course.controllers

import eduflow.admin.course.dto.section.SectionCreateRequest
import eduflow.admin.course.models.CourseSectionModel
import eduflow.admin.course.repositories.CourseSectionRepository
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
        )
        return sectionRepository.save(newSection)
    }

}
