package flowledge.course.course.version

interface CourseVersionLesson : CourseVersionItem {
    val _id: String

    val isDraft: Boolean?

    val videoId: String?
    val surveyId: String?
    val hasSynopsis: Boolean?
}