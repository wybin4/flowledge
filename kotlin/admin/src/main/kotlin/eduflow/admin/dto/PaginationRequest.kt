package flowledge.admin.dto

import org.springframework.web.bind.annotation.RequestParam

data class PaginationRequest(
    @RequestParam(defaultValue = "1") val page: Int = 1,
    @RequestParam(defaultValue = "10") val pageSize: Int = 10,
    @RequestParam(required = false) val searchQuery: String? = null,
    @RequestParam(required = false) val sortQuery: String? = null
) {
    fun toMap(): Map<String, Any> = mutableMapOf<String, Any>().apply {
        put("page", page)
        put("pageSize", pageSize)
        searchQuery?.let { put("searchQuery", it) }
        sortQuery?.let { put("sortQuery", it) }
    }
}