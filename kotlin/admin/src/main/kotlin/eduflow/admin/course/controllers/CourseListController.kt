package eduflow.admin.course.controllers

import eduflow.admin.course.dto.course.get.CourseGetByIdResponse
import eduflow.admin.course.dto.course.get.CourseGetByIdSmallResponse
import eduflow.admin.course.dto.course.list.ToggleFavouriteRequest
import eduflow.admin.course.models.CourseModel
import eduflow.admin.course.models.CourseSubscriptionModel
import eduflow.admin.course.repositories.CourseRepository
import eduflow.admin.course.repositories.CourseSubscriptionRepository
import eduflow.admin.course.services.CourseService
import eduflow.course.CourseSubscription
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono
import java.util.*

@RestController
@RequestMapping("/api/courses-list")
class CourseListController(
    private val courseService: CourseService,
    private val courseSubscriptionRepository: CourseSubscriptionRepository
) {
    @GetMapping("/courses.get")
    fun getAllCourses(
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "10") pageSize: Int,
        @RequestParam(required = false) searchQuery: String?,
        @RequestParam(required = false) sortQuery: String?
    ): Mono<ResponseEntity<List<CourseGetByIdSmallResponse>>> {
         val options = mapOf(
            "page" to page as Any,
            "pageSize" to pageSize as Any,
            "searchQuery" to searchQuery as Any,
            "sortQuery" to sortQuery as Any
        )

        return courseService.getCourses(options, "test_id") // TODO()
            .map { ResponseEntity.ok(it) }
    }

    @GetMapping("/courses.get/{id}")
    fun getCourseById(@PathVariable id: String): Mono<ResponseEntity<out CourseGetByIdResponse>> {
        return courseService.getCourseById(id, false, "test_id") // TODO()
    }

    @PostMapping("/courses.toggle-favourite/{id}")
    fun toggleFavouriteCourse(
        @PathVariable id: String,
        @RequestBody body: ToggleFavouriteRequest
    ): Mono<ResponseEntity<Unit>> {
        val userId = body.userId
        val isFavourite = body.isFavourite

        return courseSubscriptionRepository.findByCourseIdAndUserId(id, userId)
            .switchIfEmpty(
                courseSubscriptionRepository.save(
                    CourseSubscriptionModel(
                        _id = UUID.randomUUID().toString(),
                        userId = userId,
                        courseId = id,
                        isSubscribed = false,
                        isFavourite = isFavourite,
                        roles = null,
                        createdAt = Date(),
                        updatedAt = Date()
                    )
                )
            )
            .flatMap { subscription ->
                subscription.isFavourite = isFavourite
                courseSubscriptionRepository.save(subscription)
                    .thenReturn(ResponseEntity.ok(Unit))
            }
    }
}
