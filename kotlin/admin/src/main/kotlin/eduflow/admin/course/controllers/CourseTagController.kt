package flowledge.admin.course.controllers

import flowledge.admin.course.dto.tag.CourseTagSaveRequest
import flowledge.admin.course.models.CourseTagModel
import flowledge.admin.course.repositories.tag.CourseTagRepository
import flowledge.admin.course.services.CourseTagService
import flowledge.admin.dto.PaginationRequest
import flowledge.admin.utils.generateId
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api")
class CourseTagController(
    private val tagRepository: CourseTagRepository,
    private val tagService: CourseTagService
) {

    @GetMapping("/course-tags.get")
    fun getAllTags(params: PaginationRequest): Mono<ResponseEntity<List<CourseTagModel>>> {
        return tagService.getTags(params.toMap())
            .map { ResponseEntity.ok(it) }
    }

    @GetMapping("/course-tags.count")
    fun getTagsCount(@RequestParam(required = false) searchQuery: String?): Mono<ResponseEntity<Long>> {
        return tagRepository.countByNameContainingIgnoreCase(searchQuery)
            .map { ResponseEntity.ok(it) }
    }

    @PostMapping("/course-tags.create")
    fun addTag(@RequestBody request: CourseTagSaveRequest): Flux<ResponseEntity<Void>> {
        return tagRepository.findByName(request.name)
            .flatMap<ResponseEntity<Void>> { _ ->
                Mono.error(ResponseStatusException(HttpStatus.CONFLICT, "Tag with this name already exists"))
            }
            .switchIfEmpty(
                tagRepository.save(CourseTagModel(_id = generateId(), name = request.name))
                    .then(Mono.just(ResponseEntity.status(HttpStatus.CREATED).build()))
            )
            .onErrorResume { e ->
                when (e) {
                    is ResponseStatusException -> Mono.just(ResponseEntity.status(e.statusCode).build())
                    else -> Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build())
                }
            }
    }

    @GetMapping("/course-tags.get/{id}")
    fun getTagById(@PathVariable id: String): Mono<CourseTagModel> {
        return tagRepository.findById(id)
    }

    @PostMapping("/course-tags.update/{id}")
    fun updateTag(
        @PathVariable id: String,
        @RequestBody tag: CourseTagSaveRequest
    ): Mono<ResponseEntity<CourseTagModel>> {
        return tagRepository.findById(id)
            .flatMap { existingCourse ->
                val updatedCourse = existingCourse.copy(
                    name = tag.name,
                )
                tagRepository.save(updatedCourse)
            }
            .map { ResponseEntity.ok(it) }
            .defaultIfEmpty(ResponseEntity.notFound().build())
    }

    @DeleteMapping("/course-tags.delete/{id}")
    fun deleteCourse(@PathVariable id: String): Mono<ResponseEntity<Void>> {
        return tagRepository.deleteById(id)
            .then(Mono.just<ResponseEntity<Void>>(ResponseEntity.noContent().build()))
            .onErrorResume { Mono.just(ResponseEntity.notFound().build()) }
    }
}
