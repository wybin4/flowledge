package eduflow.admin.course.services

import eduflow.admin.course.models.CourseTagModel
import eduflow.admin.course.repositories.tag.CourseTagRepository
import eduflow.admin.services.PaginationAndSortingService
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class CourseTagService(
    private val tagRepository: CourseTagRepository,
) : PaginationAndSortingService() {
    fun getTags(
        options: Map<String, Any>
    ): Mono<List<CourseTagModel>> {
        return this.getPaginatedAndSorted(options, tagRepository)
    }
}