package eduflow.admin.course.services.lesson

import eduflow.admin.course.dto.lesson.create.*
import eduflow.admin.course.models.CourseSectionModel
import eduflow.admin.course.models.lesson.CourseLessonModel
import eduflow.admin.course.repositories.CourseSectionRepository
import eduflow.admin.course.repositories.lessons.CourseLessonRepository
import eduflow.user.Language
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import reactor.core.publisher.Mono

@Service
class CourseLessonService(
    private val lessonRepository: CourseLessonRepository,
    private val sectionRepository: CourseSectionRepository
) {
    fun createDraft(lesson: LessonCreateDraftRequest, locale: Language): Mono<LessonCreateResponse> {
        return sectionRepository.findById(lesson.sectionId)
            .flatMap { section ->
                val draftChecks = section.lessons?.map { lessonId ->
                    lessonRepository.findById(lessonId)
                        .map { it.isDraft ?: false }
                        .defaultIfEmpty(false)
                } ?: emptyList()

                Mono.zip(draftChecks) { results: Array<Any> ->
                    results.count { it as Boolean }
                }
                    .flatMap { draftCount ->
                        val title = when (locale) {
                            Language.RU -> "черновик лекции ${draftCount + 1}"
                            Language.EN -> "draft lecture ${draftCount + 1}"
                            else -> "draft lecture ${draftCount + 1}"
                        }

                        val newLesson = CourseLessonModel.create(
                            title = title,
                            sectionId = lesson.sectionId,
                            courseVersions = listOfNotNull(section.courseVersions.lastOrNull())
                        )

                        lessonRepository.save(newLesson)
                            .flatMap { savedLesson ->
                                val updatedLessons = section.lessons?.toMutableList() ?: mutableListOf()
                                updatedLessons.add(savedLesson._id)

                                section.lessons = updatedLessons
                                sectionRepository.save(section)
                                    .then(Mono.just(LessonCreateResponse(savedLesson._id)))
                            }
                    }
            }
            .switchIfEmpty(Mono.error(NoSuchElementException("Section not found")))
    }

    fun addVideo(lesson: LessonAddVideoRequest): Mono<LessonCreateResponse> {
        if (lesson.videoId == null && (lesson.synopsis != null || lesson.survey != null)) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "synopsis and surveyText require videoId")
        }
        if (lesson.survey != null && lesson.synopsis == null) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "surveyText requires synopsis")
        }

        return lessonRepository.findById(lesson._id)
            .flatMap { existingLesson ->
                existingLesson.videoId = lesson.videoId
                existingLesson.surveyText = lesson.survey
                existingLesson.synopsisText = lesson.synopsis
                lessonRepository.save(existingLesson)
            }
            .map { savedLesson -> LessonCreateResponse(savedLesson._id) }
    }

    fun removeVideo(lesson: LessonRemoveVideoRequest): Mono<LessonCreateResponse> {
        return lessonRepository.findById(lesson._id)
            .flatMap { existingLesson ->
                existingLesson.videoId = null
                existingLesson.surveyText = null
                existingLesson.synopsisText = null
                lessonRepository.save(existingLesson)
            }
            .map { savedLesson -> LessonCreateResponse(savedLesson._id) }
    }

    fun addDetails(lesson: LessonAddDetailsRequest): Mono<LessonCreateResponse> {
        return lessonRepository.findById(lesson._id)
            .flatMap { existingLesson ->
                if (lesson.autoDetect) {
                    if (lesson.time != null || lesson.timeUnit != null) {
                        return@flatMap Mono.error<CourseLessonModel>(
                            ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Time and timeUnit should be null when autoDetect is true"
                            )
                        )
                    }
                    // TODO: здесь будет логика для autoDetect
                } else {
                    if (lesson.time == null || lesson.timeUnit == null) {
                        return@flatMap Mono.error<CourseLessonModel>(
                            ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Time and timeUnit should not be null when autoDetect is false"
                            )
                        )
                    }
                    existingLesson.time = "${lesson.time} ${lesson.timeUnit}"
                }

                existingLesson.isDraft = false
                existingLesson.title = lesson.title
                if (lesson.imageUrl != null) {
                    existingLesson.imageUrl = lesson.imageUrl
                }
                lessonRepository.save(existingLesson)
            }
            .map { savedLesson -> LessonCreateResponse(savedLesson._id) }
    }

    fun addSynopsisAndStuff(lesson: LessonAddSynopsisAndStuffRequest): Mono<LessonCreateResponse> {
        return lessonRepository.findById(lesson._id)
            .flatMap { existingLesson ->
                existingLesson.synopsisText = lesson.synopsisText
                // TODO: work with stuff
                lessonRepository.save(existingLesson)
            }
            .map { savedLesson -> LessonCreateResponse(savedLesson._id) }
    }

    fun clearSurveyText(lessonId: String): Mono<Void> {
        return lessonRepository.findById(lessonId)
            .flatMap { lesson ->
                val updatedLesson = lesson.copy(surveyText = null)
                lessonRepository.save(updatedLesson)
            }
            .then()
    }

    fun getVisibleLessons(section: CourseSectionModel): Mono<List<CourseLessonModel>> {
        val lessonIds = section.lessons ?: emptyList()
        return lessonRepository.findAllById(lessonIds)
            .filter { it.isVisible }
            .collectList()
    }
}