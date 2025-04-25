package eduflow.admin.course.controllers

import eduflow.admin.course.dto.subscription.CourseSubscriptionGetResponse
import eduflow.admin.course.services.CourseService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux

@RestController
@RequestMapping("/api")
class CourseSubscriptionController(
    private val courseService: CourseService,
) {

    @GetMapping("/course-subscriptions.get")
    fun getSubscriptionsByUserId(): Flux<CourseSubscriptionGetResponse> {
        val userId = "test_id" // TODO()

        return courseService.getCoursesWithSubscriptionsByUserId(userId)
    }

}
