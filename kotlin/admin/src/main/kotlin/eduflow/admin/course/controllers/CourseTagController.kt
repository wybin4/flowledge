package eduflow.admin.course.controllers

import eduflow.admin.course.models.CourseTagModel
import eduflow.admin.course.repositories.CourseTagRepository
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux

@RestController
@RequestMapping("/api/courses-hub")
class CourseTagController(
    private val tagRepository: CourseTagRepository,
) {

    @GetMapping("/tags.get")
    fun getAllTags(): Flux<CourseTagModel> {
        return tagRepository.findAll()
    }

}
