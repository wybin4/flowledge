package eduflow.admin.course.controllers

import eduflow.admin.course.dto.subscription.CourseSubscriptionCreateRequest
import eduflow.admin.course.dto.subscription.CourseSubscriptionGetByCourseIdResponse
import eduflow.admin.course.dto.subscription.CourseSubscriptionGetByUserIdResponse
import eduflow.admin.course.models.CourseSubscriptionModel
import eduflow.admin.course.repositories.subscription.CourseSubscriptionRepository
import eduflow.admin.course.services.CourseSubscriptionService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.util.*

@RestController
@RequestMapping("/api")
class CourseSubscriptionController(
    private val subscriptionService: CourseSubscriptionService,
    private val subscriptionRepository: CourseSubscriptionRepository
) {

    @GetMapping("/course-subscriptions.get")
    fun getSubscriptionsByUserId(): Flux<CourseSubscriptionGetByUserIdResponse> {
        val userId = "test_id" // TODO()

        return subscriptionService.getCoursesWithSubscriptionsByUserId(userId)
    }

    @GetMapping("/course-subscriptions.get/{courseId}")
    fun getSubscriptionsByCourseId(
        @PathVariable courseId: String,
        @RequestParam(defaultValue = "5") pageSize: Int = 5
    ): Flux<CourseSubscriptionGetByCourseIdResponse> {
        return subscriptionService.getUsersWithSubscriptionsByCourseId(courseId, pageSize)
    }

    @GetMapping("/course-subscriptions.count/{courseId}")
    fun getSubscriptionsCountByCourseId(
        @PathVariable courseId: String
    ): Mono<ResponseEntity<Long>> {
        return subscriptionRepository.countByCourseIdAndIsSubscribed(courseId, true)
            .map { ResponseEntity.ok(it) }
    }

    @PostMapping("/course-subscriptions.create")
    fun createSubscription(@RequestBody body: CourseSubscriptionCreateRequest): Mono<ResponseEntity<Unit>> {
        val userIds = body.userIds
        val courseId = body.courseId

        return Flux.fromIterable(userIds)
            .flatMap { userId ->
                subscriptionRepository.findByCourseIdAndUserId(courseId, userId)
                    .switchIfEmpty(
                        subscriptionRepository.save(
                            CourseSubscriptionModel(
                                _id = UUID.randomUUID().toString(),
                                userId = userId,
                                courseId = courseId,
                                isSubscribed = true,
                                isFavourite = false,
                                roles = null,
                                createdAt = Date(),
                                updatedAt = Date()
                            )
                        )
                    )
                    .flatMap { subscription ->
                        subscription.isSubscribed = true
                        subscriptionRepository.save(subscription)
                    }
            }
            .then(Mono.just(ResponseEntity.ok(Unit)))
    }
}
