package flowledge.admin.course.controllers

import flowledge.admin.course.dto.course.id.CourseGetByIdResponse
import flowledge.admin.course.dto.course.id.CourseGetByIdSmallResponse
import flowledge.admin.course.dto.course.list.ToggleFavouriteRequest
import flowledge.admin.course.models.subscription.CourseSubscriptionModel
import flowledge.admin.course.repositories.subscription.CourseSubscriptionRepository
import flowledge.admin.course.services.CourseTagService
import flowledge.admin.course.services.course.CourseService
import flowledge.admin.dto.PaginationRequest
import flowledge.admin.ldap.LDAPService
import flowledge.admin.services.AuthenticationService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/courses-list")
class CourseListController(
    private val courseService: CourseService,
    private val ldapService: LDAPService,
    private val tagService: CourseTagService,
    private val courseSubscriptionRepository: CourseSubscriptionRepository,
    private val authenticationService: AuthenticationService
) {
    @GetMapping("/courses.get")
    fun getAllCourses(
        params: PaginationRequest,
        @RequestParam(required = false) excludedIds: List<String>?
    ): Mono<ResponseEntity<List<CourseGetByIdSmallResponse>>> {
        val user = authenticationService.getCurrentUser()
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
    fun getCourseById(
        @PathVariable id: String,
        @RequestParam(required = false) versionId: String? = null
    ): Mono<ResponseEntity<out CourseGetByIdResponse>> {
        val user = authenticationService.getCurrentUser()
        return courseService.getCourseById(id, false, user._id, versionId)
    }

    @PostMapping("/courses.toggle-favourite/{id}")
    fun toggleFavouriteCourse(
        @PathVariable id: String,
        @RequestBody body: ToggleFavouriteRequest
    ): Mono<ResponseEntity<Unit>> {
        val user = authenticationService.getCurrentUser()
        val userId = user._id
        val isFavourite = body.isFavourite

        return courseSubscriptionRepository.findByCourseIdAndUserId(id, userId)
            .switchIfEmpty(
                courseSubscriptionRepository.save(
                    CourseSubscriptionModel.create(
                        userId = userId,
                        courseId = id,
                        isFavourite = isFavourite
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
