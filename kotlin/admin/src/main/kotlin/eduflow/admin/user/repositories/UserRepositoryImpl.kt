package flowledge.admin.user.repositories

import flowledge.admin.user.models.UserModel
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux

@Repository
class UserRepositoryImpl(private val mongoTemplate: MongoTemplate) :
    UserRepositoryTemplate {
    override fun findByValueContainingIgnoreCase(
        value: String,
        pageable: Pageable,
        criteriaModifier: (Criteria) -> Criteria
    ): Flux<UserModel> {
        val criteria = criteriaModifier(Criteria.where("username").regex(value, "i"))
        val query = Query.query(criteria).with(pageable)
        return Flux.fromIterable(mongoTemplate.find(query, UserModel::class.java))
    }
}