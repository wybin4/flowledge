package eduflow.admin.repositories

import eduflow.admin.models.PrivateSettingModel
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.stereotype.Repository

@Repository
interface PrivateSettingRepository : ReactiveMongoRepository<PrivateSettingModel, String> {
}
