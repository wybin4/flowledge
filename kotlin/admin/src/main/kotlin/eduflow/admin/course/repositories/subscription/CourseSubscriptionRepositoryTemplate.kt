package flowledge.admin.course.repositories.subscription

import reactor.core.publisher.Mono

interface CourseSubscriptionRepositoryTemplate {
    fun unsetRolesById(id: String): Mono<Void>
}