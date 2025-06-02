package flowledge.course.subscription.progress

interface CourseProgressLesson : CourseProgressItem {
    val videoProgress: Double?
    val synopsisProgress: Double?
    val isSurveyPassed: Boolean?
    // TODO: stuff
}