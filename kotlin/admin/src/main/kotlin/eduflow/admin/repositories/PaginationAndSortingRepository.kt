package eduflow.admin.repositories

import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.core.query.Criteria
import reactor.core.publisher.Flux

interface PaginationAndSortingRepository<T, ID> {
    fun findByValueContainingIgnoreCase(
        value: String,
        pageable: Pageable,
        criteriaModifier: (Criteria) -> Criteria = { it }
    ): Flux<T>
}