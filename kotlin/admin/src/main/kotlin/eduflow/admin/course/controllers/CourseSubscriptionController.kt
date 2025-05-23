package eduflow.admin.course.controllers

import eduflow.admin.course.dto.subscription.CourseSubscriptionCreateRequest
import eduflow.admin.course.dto.subscription.CourseSubscriptionGetByCourseIdResponse
import eduflow.admin.course.dto.subscription.CourseSubscriptionGetByUserIdResponse
import eduflow.admin.course.dto.subscription.progress.CourseInitiateProgressRequest
import eduflow.admin.course.dto.subscription.progress.CourseSendProgressRequest
import eduflow.admin.course.models.subscription.CourseSubscriptionModel
import eduflow.admin.course.repositories.subscription.CourseSubscriptionRepository
import eduflow.admin.course.services.subscription.CourseProgressService
import eduflow.admin.course.services.subscription.CourseSubscriptionService
import eduflow.admin.services.AuthenticationService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api")
class CourseSubscriptionController(
    private val subscriptionService: CourseSubscriptionService,
    private val subscriptionRepository: CourseSubscriptionRepository,
    private val progressService: CourseProgressService,
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

    @PostMapping("/course-subscriptions/progress.initiate")
    fun initiateProgress(@RequestBody body: CourseInitiateProgressRequest): Mono<ResponseEntity<String?>> {
        val user = authenticationService.getCurrentUser()
        val userId = user._id
        return progressService.initiate(body, userId)
            .flatMap { sub ->
                Mono.just(ResponseEntity.ok(sub.courseVersion))
            }
            .onErrorResume { error ->
                when (error) {
                    is NoSuchElementException -> Mono.just(
                        ResponseEntity.status(HttpStatus.NOT_FOUND).body(error.message)
                    )

                    else -> Mono.just(
                        ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error")
                    )
                }
            }
    }

    @PostMapping("/course-subscriptions/progress.send")
    fun sendProgress(@RequestBody body: CourseSendProgressRequest): Mono<ResponseEntity<Unit>> {
        return progressService.send(body)
            .then(Mono.just(ResponseEntity.ok(Unit)))
    }
}
