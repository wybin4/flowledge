package eduflow.admin.listeners

import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.mongodb.core.ChangeStreamOptions
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.aggregation.Aggregation
import org.springframework.data.mongodb.core.query.Criteria

abstract class AbstractMongoChangeStreamListener<T : Any> {
    @Autowired
    private lateinit var mongoTemplate: ReactiveMongoTemplate

    abstract val entityClass: Class<T>

    @PostConstruct
    fun listenToChanges() {
        val aggregation = Aggregation.newAggregation(
            Aggregation.match(Criteria.where("operationType").`in`("insert", "update", "delete"))
        )

        val changeStreamOptions = ChangeStreamOptions
            .builder()
            .filter(aggregation)
            .build()

        mongoTemplate.changeStream(changeStreamOptions, entityClass)
            .doOnNext { change ->
                println("Change detected: $change")
            }
            .doOnError { error ->
                println("Error occurred: ${error.message}")
            }
            .subscribe()
    }
}
