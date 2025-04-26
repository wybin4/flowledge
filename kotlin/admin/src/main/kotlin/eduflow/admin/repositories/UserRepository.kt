package eduflow.admin.repositories

import eduflow.admin.models.UserModel
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Mono

@Repository
interface UserRepository : ReactiveMongoRepository<UserModel, String> {
    override fun findById(id: String): Mono<UserModel?>
    fun findByUsername(username: String): Mono<UserModel?>
}