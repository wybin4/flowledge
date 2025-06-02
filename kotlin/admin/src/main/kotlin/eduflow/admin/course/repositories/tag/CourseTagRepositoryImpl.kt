package flowledge.admin.course.repositories.tag

import flowledge.admin.course.models.CourseTagModel
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux

@Repository
class CourseTagRepositoryImpl(private val mongoTemplate: MongoTemplate) :
    CourseTagRepositoryTemplate {
    override fun findByValueContainingIgnoreCase(
        value: String,
        pageable: Pageable,
        criteriaModifier: (Criteria) -> Criteria
    ): Flux<CourseTagModel> {
        val criteria = criteriaModifier(Criteria.where("name").regex(value, "i"))
        val query = Query.query(criteria).with(pageable)
        return Flux.fromIterable(mongoTemplate.find(query, CourseTagModel::class.java))
    }
}