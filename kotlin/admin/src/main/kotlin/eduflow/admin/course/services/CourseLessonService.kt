package eduflow.admin.course.services

import eduflow.admin.course.dto.lesson.create.*
import eduflow.admin.course.models.CourseLessonModel
import eduflow.admin.course.repositories.CourseLessonRepository
import eduflow.user.Language
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import reactor.core.publisher.Mono
import java.util.*

@Service
class CourseLessonService(
    private val lessonRepository: CourseLessonRepository,
) {
    fun createDraft(lesson: LessonCreateDraftRequest): Mono<LessonCreateResponse> {
        val locale = Language.RU // TODO: get from user document

        val draftCount = if (lesson.courseId != null) {
            lessonRepository.countByCourseIdAndIsDraft(lesson.courseId, true).block() ?: 0
        } else if (lesson.sectionId != null) {
            lessonRepository.countBySectionIdAndIsDraft(lesson.sectionId, true).block() ?: 0
        } else {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Either courseId or sectionId must be provided")
        }

        val title = when (locale) {
            Language.RU -> "черновик лекции ${draftCount + 1}"
            Language.EN -> "draft lecture ${draftCount + 1}"
            else -> "Draft lecture ${draftCount + 1}"
        }

        val newLesson = CourseLessonModel(
            _id = UUID.randomUUID().toString(),
            title = title,
            courseId = lesson.courseId,
            sectionId = lesson.sectionId,
            isVisible = false,
            createdAt = Date(),
            updatedAt = Date(),
            isDraft = true
        )

        return lessonRepository.save(newLesson)
            .map { savedLesson -> LessonCreateResponse(savedLesson._id) }
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
                    // todo() - здесь будет логика для autoDetect
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
}