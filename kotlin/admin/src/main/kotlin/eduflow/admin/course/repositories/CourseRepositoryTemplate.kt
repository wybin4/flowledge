package eduflow.admin.course.repositories

import eduflow.admin.course.models.CourseModel
import org.springframework.data.domain.Pageable
import reactor.core.publisher.Flux

interface CourseRepositoryTemplate {
    fun findByTitleContainingIgnoreCaseWithCustomOptions(
        value: String, 
        pageable: Pageable, 
        options: Map<String, Any>
    ): Flux<CourseModel>
}