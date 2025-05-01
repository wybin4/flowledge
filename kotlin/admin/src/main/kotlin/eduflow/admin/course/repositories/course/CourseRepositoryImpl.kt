package eduflow.admin.course.repositories.course

import eduflow.admin.course.models.CourseModel
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux

@Repository
class CourseRepositoryImpl(private val mongoTemplate: MongoTemplate) : CourseRepositoryTemplate {
    override fun findByTitleContainingIgnoreCaseWithCustomOptions(
        value: String,
        pageable: Pageable,
        options: Map<String, Any>,
        excludedIds: List<String>?
    ): Flux<CourseModel> {
        val criteria = Criteria.where("title").regex(value, "i")
        if (!excludedIds.isNullOrEmpty()) {
            criteria.and("_id").nin(excludedIds)
        }
        options.forEach { (key, value) ->
            criteria.and(key).`is`(value)
        }
        val query = Query.query(criteria).with(pageable)
        return Flux.fromIterable(mongoTemplate.find(query, CourseModel::class.java))
    }
}