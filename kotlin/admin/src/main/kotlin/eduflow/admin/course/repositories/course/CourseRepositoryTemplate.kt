package flowledge.admin.course.repositories.course

import flowledge.admin.course.models.course.CourseModel
import flowledge.admin.repositories.PaginationAndSortingRepository
import reactor.core.publisher.Flux

interface CourseRepositoryTemplate : PaginationAndSortingRepository<CourseModel, String> {
    fun findByTagsInAndTitleIn(tags: List<String>, titles: List<String>): Flux<CourseModel>
}