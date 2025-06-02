package flowledge.admin.repositories

import flowledge.admin.models.PrivateSettingModel
import org.springframework.data.mongodb.repository.Query
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux

@Repository
interface PrivateSettingRepository : ReactiveMongoRepository<PrivateSettingModel, String> {
    @Query("{ '_id': { \$regex: ?0 } }")
    fun findByRegexId(regex: String): Flux<PrivateSettingModel>
}