package flowledge.admin.course.repositories.course

import flowledge.admin.course.models.course.CourseModel
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux

@Repository
class CourseRepositoryImpl(private val mongoTemplate: MongoTemplate) :
    CourseRepositoryTemplate {
    override fun findByValueContainingIgnoreCase(
        value: String,
        pageable: Pageable,
        criteriaModifier: (Criteria) -> Criteria
    ): Flux<CourseModel> {
        val criteria = criteriaModifier(Criteria.where("title").regex(value, "i"))
        val query = Query.query(criteria).with(pageable)
        return Flux.fromIterable(mongoTemplate.find(query, CourseModel::class.java))
    }

    override fun findByTagsInAndTitleIn(tags: List<String>, titles: List<String>): Flux<CourseModel> {
        val query = Query().apply {
            addCriteria(
                Criteria().orOperator(
                    Criteria.where("tags").`in`(tags),
                    Criteria.where("title").`in`(titles)
                )
            )
        }
        return Flux.fromIterable(mongoTemplate.find(query, CourseModel::class.java))
    }
}