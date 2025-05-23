package eduflow.course.subscription.progress

interface CourseProgressLesson : CourseProgressItem {
    val videoProgress: Int?
    val synopsisProgress: Int?
    val isSurveyPassed: Boolean?
    // TODO: stuff
}