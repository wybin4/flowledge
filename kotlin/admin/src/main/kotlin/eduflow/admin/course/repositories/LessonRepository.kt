package eduflow.admin.course.repositories

import eduflow.admin.course.models.SectionModel
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.data.repository.reactive.ReactiveSortingRepository
import org.springframework.stereotype.Repository

@Repository
interface SectionRepository : ReactiveMongoRepository<SectionModel, String>,
    ReactiveSortingRepository<SectionModel, String>