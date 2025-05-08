package eduflow.admin.course.controllers

import eduflow.admin.course.dto.course.id.CourseGetByIdResponse
import eduflow.admin.course.dto.course.id.CourseGetByIdSmallResponse
import eduflow.admin.course.dto.course.list.ToggleFavouriteRequest
import eduflow.admin.course.models.CourseSubscriptionModel
import eduflow.admin.course.repositories.subscription.CourseSubscriptionRepository
import eduflow.admin.course.services.CourseService
import eduflow.admin.course.services.CourseTagService
import eduflow.admin.dto.PaginationRequest
import eduflow.admin.ldap.LDAPService
import eduflow.admin.user.models.UserModel
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono
import java.util.*

@RestController
@RequestMapping("/api/courses-list")
class CourseListController(
    private val courseService: CourseService,
    private val ldapService: LDAPService,
    private val tagService: CourseTagService,
    private val courseSubscriptionRepository: CourseSubscriptionRepository
) {
    @GetMapping("/courses.get")
    fun getAllCourses(
        params: PaginationRequest,
        @RequestParam(required = false) excludedIds: List<String>?
    ): Mono<ResponseEntity<List<CourseGetByIdSmallResponse>>> {
        val authentication = SecurityContextHolder.getContext().authentication
        val user = authentication.principal as UserModel
        val userGroups = user.services?.ldap?.memberOf ?: emptyList()

        val includedNames = ldapService.getUserMappingGroupsToCoursesAndTags(userGroups)
        val includedIds: Mono<List<String>> = tagService.getCourseIdsByCoursesAndTagsNames(includedNames)

        val ids: Mono<List<String>> = includedIds
            .map { ids ->
                ids
                    .filter { it !in (excludedIds ?: emptyList()) }
                    .distinct()
            }

        return ids.flatMap { filteredIds ->
            courseService.getCourses(params.toMap(), user._id, filteredIds)
                .map { ResponseEntity.ok(it) }
        }
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
