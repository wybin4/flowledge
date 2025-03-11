package eduflow.admin.repositories

import eduflow.admin.models.UserModel
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.stereotype.Repository

@Repository
interface UserRepository : ReactiveMongoRepository<UserModel, String>