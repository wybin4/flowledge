package eduflow.admin.course.services

import eduflow.admin.course.dto.section.lessons.SectionGetLessonsItemResponse
import eduflow.admin.course.dto.section.lessons.SectionGetLessonsResponse
import eduflow.admin.course.models.CourseModel
import eduflow.admin.course.models.CourseSectionModel
import eduflow.admin.course.models.lesson.CourseLessonModel
import eduflow.admin.course.models.lesson.survey.CourseLessonSurveyModel
import eduflow.admin.course.repositories.CourseSectionRepository
import eduflow.admin.course.services.lesson.CourseLessonService
import eduflow.admin.course.services.lesson.CourseLessonSurveyService
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class CourseSectionService(
    private val lessonService: CourseLessonService,
    private val surveyService: CourseLessonSurveyService,
    private val sectionRepository: CourseSectionRepository,
) {
    fun getLessonsResponse(
        section: CourseSectionModel,
        course: CourseModel
    ): Mono<SectionGetLessonsResponse> {
        return lessonService.getVisibleLessons(section)
            .flatMap { lessons ->
                val foundedLessonIds = lessons.map { it._id }
                surveyService.getSurveysForLessons(foundedLessonIds)
                    .flatMap { surveys ->
                        createSectionGetLessonsResponse(section, course, lessons, surveys)
                    }
            }
    }

    private fun createSectionGetLessonsResponse(
        section: CourseSectionModel,
        course: CourseModel,
        lessons: List<CourseLessonModel>,
        surveys: List<CourseLessonSurveyModel>
    ): Mono<SectionGetLessonsResponse> {
        val lessonsWithSurveys = lessons.map { lesson ->
            val survey = surveys.find { it.lessonId == lesson._id }
            SectionGetLessonsItemResponse(
                _id = lesson._id,
                title = lesson.title,
                videoId = lesson.videoId,
                imageUrl = lesson.imageUrl,
                surveyId = survey?._id,
                hasSynopsis = lesson.synopsisText?.isNotEmpty(),
            )
        }

        val nextSectionId = if (course.sections != null && course.sections!!.isNotEmpty()) {
            val currentSectionIndex = course.sections!!.indexOf(section._id)
            if (currentSectionIndex != -1 && currentSectionIndex < course.sections!!.size - 1) {
                course.sections!![currentSectionIndex + 1]
            } else {
                null
            }
        } else {
            null
        }

        return if (nextSectionId != null) {
            sectionRepository.findById(nextSectionId)
                .map { nextSection ->
                    val nextSectionLessonId = nextSection.lessons?.firstOrNull()
                    SectionGetLessonsResponse(
                        title = section.title,
                        courseId = section.courseId,
                        courseName = course.title,
                        nextSectionLessonId = nextSectionLessonId,
                        lessons = lessonsWithSurveys
                    )
                }
        } else {
            Mono.just(
                SectionGetLessonsResponse(
                    title = section.title,
                    courseId = section.courseId,
                    courseName = course.title,
                    nextSectionLessonId = null,
                    lessons = lessonsWithSurveys
                )
            )
        }
    }

    fun removeLessonFromSection(sectionId: String, lessonId: String): Mono<Void> {
        return sectionRepository.findById(sectionId)
            .flatMap { section ->
                val updatedLessons = section.lessons?.toMutableList() ?: mutableListOf()
                updatedLessons.remove(lessonId)

                section.lessons = updatedLessons
                sectionRepository.save(section).then()
            }
    }
}