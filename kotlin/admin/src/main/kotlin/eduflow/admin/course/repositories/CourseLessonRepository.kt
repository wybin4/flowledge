package eduflow.admin.course.repositories

import eduflow.admin.course.models.CourseLessonModel
import org.springframework.data.mongodb.repository.Query
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.data.repository.reactive.ReactiveSortingRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Repository
interface CourseLessonRepository : ReactiveMongoRepository<CourseLessonModel, String>,
    ReactiveSortingRepository<CourseLessonModel, String> {
    fun findByCourseId(courseId: String): Flux<CourseLessonModel>

    fun findBySectionId(sectionId: String): Flux<CourseLessonModel>

    fun countByCourseIdAndIsDraft(courseId: String, isDraft: Boolean): Mono<Long>

    fun countBySectionIdAndIsDraft(sectionId: String, isDraft: Boolean): Mono<Long>

    @Query("{ \$and: [ { \$or: [ { courseId: ?0 }, { sectionId: { \$in: ?1 } } ] }, { isVisible: ?2 } ] }")
    fun findByCourseIdOrSectionIdsAndIsVisible(
        courseId: String, sectionIds: List<String>, isVisible: Boolean? = false
    ): Flux<CourseLessonModel>

    @Query("{ \$or: [ { courseId: ?0 }, { sectionId: { \$in: ?1 } } ] }")
    fun findByCourseIdOrSectionIds(
        courseId: String, sectionIds: List<String>
    ): Flux<CourseLessonModel>
}