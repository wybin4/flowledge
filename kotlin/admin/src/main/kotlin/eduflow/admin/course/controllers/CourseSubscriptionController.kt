package flowledge.admin.course.controllers

import flowledge.admin.course.dto.subscription.CourseSubscriptionCreateRequest
import flowledge.admin.course.dto.subscription.CourseSubscriptionGetByCourseIdResponse
import flowledge.admin.course.dto.subscription.CourseSubscriptionGetByUserIdResponse
import flowledge.admin.course.dto.subscription.progress.CourseSendProgressRequest
import flowledge.admin.course.dto.subscription.progress.initiate.CourseInitiateProgressRequest
import flowledge.admin.course.dto.subscription.progress.initiate.CourseInitiateProgressResponse
import flowledge.admin.course.models.subscription.CourseSubscriptionModel
import flowledge.admin.course.repositories.subscription.CourseSubscriptionRepository
import flowledge.admin.course.services.subscription.CourseProgressService
import flowledge.admin.course.services.subscription.CourseSubscriptionService
import flowledge.admin.services.AuthenticationService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
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
    fun initiateProgress(@RequestBody body: CourseInitiateProgressRequest): Mono<ResponseEntity<CourseInitiateProgressResponse>> {
        val user = authenticationService.getCurrentUser()
        val userId = user._id
        return progressService.initiate(body, userId)
            .flatMap { sub ->
                Mono.just(ResponseEntity.ok(sub.courseVersion?.let { CourseInitiateProgressResponse(it) }))
            }
            .onErrorResume { error ->
                when (error) {
                    is NoSuchElementException -> Mono.error(
                        ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            error.message
                        )
                    )

                    else -> Mono.error(
                        ResponseStatusException(
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            "Internal server error"
                        )
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
