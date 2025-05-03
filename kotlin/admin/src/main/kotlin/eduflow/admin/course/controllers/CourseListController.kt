package eduflow.admin.course.controllers

import eduflow.admin.course.dto.course.id.CourseGetByIdResponse
import eduflow.admin.course.dto.course.id.CourseGetByIdSmallResponse
import eduflow.admin.course.dto.course.list.ToggleFavouriteRequest
import eduflow.admin.course.models.CourseSubscriptionModel
import eduflow.admin.course.repositories.subscription.CourseSubscriptionRepository
import eduflow.admin.course.services.CourseService
import eduflow.admin.dto.PaginationRequest
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
        params: PaginationRequest,
        @RequestParam(required = false) excludedIds: List<String>?
    ): Mono<ResponseEntity<List<CourseGetByIdSmallResponse>>> {
        return courseService.getCourses(params.toMap(), "test_id", excludedIds)
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
