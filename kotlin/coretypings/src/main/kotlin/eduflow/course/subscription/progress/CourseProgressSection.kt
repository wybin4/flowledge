package eduflow.course.subscription.progress

interface CourseProgressSection : CourseProgressItem {
    val lessons: List<CourseProgressLesson>
}