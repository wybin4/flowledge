package eduflow.admin.course.repositories.course

import eduflow.admin.course.models.CourseModel
import eduflow.admin.repositories.PaginationAndSortingRepository
import reactor.core.publisher.Flux

interface CourseRepositoryTemplate : PaginationAndSortingRepository<CourseModel, String> {
    fun findByTagsInAndTitleIn(tags: List<String>, titles: List<String>): Flux<CourseModel>
}