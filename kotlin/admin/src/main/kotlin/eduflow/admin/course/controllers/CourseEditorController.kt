package eduflow.admin.course.controllers

import eduflow.admin.course.dto.editor.CourseEditorsUpdateRequest
import eduflow.admin.course.models.CourseSubscriptionModel
import eduflow.admin.course.repositories.subscription.CourseSubscriptionRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.util.*

@RestController
@RequestMapping("/api/courses-hub")
class CourseEditorController(
    private val subscriptionRepository: CourseSubscriptionRepository
) {

    @PostMapping("/editors.update")
    fun updateCourseEditors(@RequestBody request: CourseEditorsUpdateRequest): Mono<ResponseEntity<Void>> {
        return Flux.fromIterable(request.editors)
            .flatMap { editor ->
                subscriptionRepository.findByCourseIdAndUserId(request.courseId, editor._id)
                    .flatMap { existingSubscription ->
                        if (editor.roles.isEmpty()) {
                            subscriptionRepository.unsetRolesById(existingSubscription._id).then()
                        } else {
                            existingSubscription.copy(
                                roles = editor.roles,
                                updatedAt = Date()
                            ).let { updatedSubscription ->
                                subscriptionRepository.save(updatedSubscription)
                            }
                        }
                    }
                    .switchIfEmpty(
                        Mono.defer {
                            if (editor.roles.isNotEmpty()) {
                                subscriptionRepository.save(
                                    CourseSubscriptionModel(
                                        _id = UUID.randomUUID().toString(),
                                        courseId = request.courseId,
                                        createdAt = Date(),
                                        isFavourite = false,
                                        isSubscribed = true,
                                        roles = editor.roles,
                                        updatedAt = Date(),
                                        userId = editor._id
                                    )
                                )
                            } else {
                                Mono.empty()
                            }
                        }
                    )
            }
            .then()
            .thenReturn(ResponseEntity.noContent().build())
    }

}
