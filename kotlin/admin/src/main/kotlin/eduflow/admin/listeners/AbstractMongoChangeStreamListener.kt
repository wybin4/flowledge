package eduflow.admin.listeners

import com.mongodb.client.model.changestream.OperationType
import eduflow.common.logging.MainLogger
import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.mongodb.core.ChangeStreamOptions
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.aggregation.Aggregation
import org.springframework.data.mongodb.core.query.Criteria

abstract class AbstractMongoChangeStreamListener<T : Any> {

    @Autowired
    private lateinit var mongoTemplate: ReactiveMongoTemplate

    private val logger: MainLogger = MainLogger(this.javaClass.simpleName)

    abstract val entityClass: Class<T>

    @PostConstruct
    fun listenToChanges() {
        val collectionName = getCollectionName()
        logger.info("Listening to changes in collection: $collectionName")

        val aggregation = Aggregation.newAggregation(
            Aggregation.match(Criteria.where("operationType").`in`("insert", "update", "delete", "replace")),
            Aggregation.match(Criteria.where("ns.coll").`is`(collectionName))
        )

        val changeStreamOptions = ChangeStreamOptions
            .builder()
            .filter(aggregation)
            .build()

        mongoTemplate.changeStream(changeStreamOptions, entityClass)
            .doOnNext { change ->
                val operationType = change.operationType // Получаем тип операции (insert, update, delete, etc.)
                logger.info("Change detected: $change (operation: $operationType)")

                change.body?.let { handleChange(operationType, it) }
            }
            .doOnError { error ->
                logger.error("Error processing changes: ${error.message}")
            }
            .subscribe()
    }

    abstract fun handleChange(action: OperationType?, record: T)

    abstract fun getCollectionName(): String
}
