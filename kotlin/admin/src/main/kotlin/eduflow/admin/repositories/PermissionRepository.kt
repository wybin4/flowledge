package eduflow.admin.repositories

import eduflow.admin.models.PermissionModel
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.stereotype.Repository

@Repository
interface PermissionRepository : ReactiveMongoRepository<PermissionModel, String>