package eduflow.admin.course.services

import eduflow.admin.course.models.CourseModel
import eduflow.admin.course.repositories.CourseRepository
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort

@Service
class CourseService(
    private val courseRepository: CourseRepository
) {
       fun getCourses(options: Map<String, Any>): Mono<List<CourseModel>> {
        val page = options["page"] as? Int ?: 1
        val pageSize = options["pageSize"] as? Int ?: 10
        val searchQuery = options["searchQuery"] as? String
        val sortQuery = options["sortQuery"] as? String

        val (sortField, sortOrder) = if (sortQuery.isNullOrEmpty()) {
            "createdAt" to Sort.Direction.DESC
        } else {
            sortQuery.split(":").let { it[0] to if (it.getOrElse(1) { "bottom" } == "top") Sort.Direction.ASC else Sort.Direction.DESC }
        }
        val pageable = PageRequest.of(page - 1, pageSize, Sort.by(sortOrder, sortField))

       val filteredOptions = mutableMapOf<String, Any>()
        options.forEach { (key, value) ->
            when (key) {
                "page", "pageSize", "searchQuery", "sortQuery" -> {
                    // Эти параметры уже обработаны выше, пропускаем их
                }
                else -> {
                    // Добавляем остальные параметры в filteredOptions
                    filteredOptions[key] = value
                }
            }
        }

        return courseRepository.findByTitleContainingIgnoreCaseWithCustomOptions(searchQuery ?: "", pageable, filteredOptions)
            .collectList()
    }
}