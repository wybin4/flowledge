package eduflow.admin.course.services

import eduflow.admin.course.models.CourseModel
import eduflow.admin.course.models.CourseTagModel
import eduflow.admin.course.repositories.course.CourseRepository
import eduflow.admin.course.repositories.tag.CourseTagRepository
import eduflow.admin.services.PaginationAndSortingService
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class CourseTagService(
    private val tagRepository: CourseTagRepository,
    private val courseRepository: CourseRepository,
) : PaginationAndSortingService() {
    fun getTags(
        options: Map<String, Any>
    ): Mono<List<CourseTagModel>> {
        return this.getPaginatedAndSorted(options, tagRepository)
    }

    fun getUpdatedTagsByCourses(courses: List<CourseModel>): Mono<Map<String, List<String>>> {
        val tagIds = courses.flatMap { it.tags ?: emptyList() }.distinct()

        return tagRepository.findByIdIn(tagIds).collectList().map { tags ->
            val tagMap = tags.associateBy { it._id }

            courses.associate { course ->
                course._id to (course.tags?.mapNotNull { tagId ->
                    tagMap[tagId]?.name
                } ?: emptyList())
            }
        }
    }

    fun getUpdatedTagsByCourse(course: CourseModel): Mono<Map<String, List<String>>> {
        val tagIds = course.tags ?: emptyList()

        return tagRepository.findByIdIn(tagIds).collectList().map { tags ->
            val tagMap = tags.associateBy { it._id }

            mapOf(
                course._id to (course.tags?.mapNotNull { tagId ->
                    tagMap[tagId]?.name
                } ?: emptyList())
            )
        }
    }

    private fun getCoursesByTagIdsAndCourseTitles(
        tagIds: List<String>,
        includedNames: List<String>
    ): Mono<List<String>> {
        return courseRepository.findByTagsInAndTitleIn(tagIds, includedNames)
            .map { it._id }
            .collectList()
    }

    fun getCourseIdsByCoursesAndTagsNames(names: List<String>): Mono<List<String>> {
        return tagRepository.findByNameIn(names)
            .collectList()
            .flatMap { tags ->
                val tagIds = tags.map { it._id }
                getCoursesByTagIdsAndCourseTitles(tagIds, names)
            }
    }
}