package eduflow.admin.repositories

import eduflow.admin.models.RoleModel
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.stereotype.Repository

@Repository
interface RoleRepository : ReactiveMongoRepository<RoleModel, String>