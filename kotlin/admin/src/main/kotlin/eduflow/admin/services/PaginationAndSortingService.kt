package flowledge.admin.services

import flowledge.admin.repositories.PaginationAndSortingRepository
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.data.mongodb.core.query.Criteria
import reactor.core.publisher.Mono

abstract class PaginationAndSortingService {
    fun <T, R> getPaginatedAndSorted(
        options: Map<String, Any>,
        repository: PaginationAndSortingRepository<T, String>,
        criteriaModifier: (Criteria) -> Criteria = { it },
        callback: (List<T>) -> Mono<List<R>> = { items -> Mono.just(items as List<R>) }
    ): Mono<List<R>> {
        val page = options["page"] as? Int ?: 1
        val pageSize = options["pageSize"] as? Int ?: 10
        val searchQuery = options["searchQuery"] as? String ?: ""
        val sortQuery = options["sortQuery"] as? String

        val (sortField, sortOrder) = if (sortQuery.isNullOrEmpty()) {
            "createdAt" to Sort.Direction.DESC
        } else {
            sortQuery.split(":")
                .let { it[0] to if (it.getOrElse(1) { "bottom" } == "top") Sort.Direction.ASC else Sort.Direction.DESC }
        }
        val pageable = PageRequest.of(page - 1, pageSize, Sort.by(sortOrder, sortField))

        return repository.findByValueContainingIgnoreCase(
            searchQuery, pageable, criteriaModifier
        ).collectList()
            .flatMap { items ->
                callback(items)
            }
    }
}