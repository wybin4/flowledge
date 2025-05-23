package eduflow.admin.course.repositories.subscription

import eduflow.admin.course.models.subscription.CourseSubscriptionModel
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.stereotype.Repository
import reactor.core.publisher.Mono
import reactor.kotlin.core.publisher.toMono

@Repository
class CourseSubscriptionRepositoryImpl(private val mongoTemplate: MongoTemplate) :
    CourseSubscriptionRepositoryTemplate {
    override fun unsetRolesById(id: String): Mono<Void> {
        return mongoTemplate.updateFirst(
            Query.query(Criteria.where("_id").`is`(id)),
            Update().unset("roles"),
            CourseSubscriptionModel::class.java
        ).toMono().then()
    }
}