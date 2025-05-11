package eduflow.admin.course.controllers

import eduflow.admin.course.dto.subscription.CourseSubscriptionCreateRequest
import eduflow.admin.course.dto.subscription.CourseSubscriptionGetByCourseIdResponse
import eduflow.admin.course.dto.subscription.CourseSubscriptionGetByUserIdResponse
import eduflow.admin.course.models.CourseSubscriptionModel
import eduflow.admin.course.repositories.subscription.CourseSubscriptionRepository
import eduflow.admin.course.services.CourseSubscriptionService
import eduflow.admin.services.AuthenticationService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api")
class CourseSubscriptionController(
    private val subscriptionService: CourseSubscriptionService,
    private val subscriptionRepository: CourseSubscriptionRepository,
    private val authenticationService: AuthenticationService
) {

    @GetMapping("/course-subscriptions.get")
    fun getSubscriptionsByUserId(): Flux<CourseSubscriptionGetByUserIdResponse> {
        val user = authenticationService.getCurrentUser()
        return subscriptionService.getCoursesWithSubscriptionsByUserId(user._id)
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
                            CourseSubscriptionModel.create(
                                userId = userId,
                                courseId = courseId,
                                isSubscribed = true,
                                isFavourite = false,
                                roles = null,
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
