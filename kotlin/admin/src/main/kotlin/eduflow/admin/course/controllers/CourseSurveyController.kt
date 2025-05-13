package eduflow.admin.course.controllers

import eduflow.admin.course.models.survey.CourseSurveyModel
import eduflow.admin.course.repositories.CourseSurveyRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/courses-hub")
class CourseSurveyController(
    private val surveyRepository: CourseSurveyRepository,
) {

    @GetMapping("/surveys.get/{id}")
    fun getSurveyByLessonId(
        @PathVariable id: String
    ): Mono<ResponseEntity<CourseSurveyModel>> {
        return surveyRepository.findByLessonId(id)
            .map { ResponseEntity.ok(it) }
            .defaultIfEmpty(ResponseEntity.notFound().build())
    }

}
