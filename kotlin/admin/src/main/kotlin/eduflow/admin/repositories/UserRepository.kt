package eduflow.admin.repositories

import eduflow.admin.models.UserModel
import org.springframework.data.mongodb.repository.Query
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Repository
interface UserRepository : ReactiveMongoRepository<UserModel, String> {
    override fun findById(id: String): Mono<UserModel?>
    fun findByUsername(username: String): Mono<UserModel?>

    @Query(value = "{ '_id': { \$in: ?0 } }", fields = "{ 'id': 1, 'name': 1, 'username': 1 }")
    fun findUsersByIds(ids: List<String>): Flux<BaseUser>

    @Query("{ '_id': { \$nin: ?0 }, \$or: [ { 'name': { \$regex: ?1, \$options: 'i' } }, { 'username': { \$regex: ?1, \$options: 'i' } } ] }")
    fun findAllExcludingIds(excludedIds: List<String>?, searchQuery: String?): Flux<UserModel>

    data class BaseUser(val _id: String, val name: String, val username: String)
}