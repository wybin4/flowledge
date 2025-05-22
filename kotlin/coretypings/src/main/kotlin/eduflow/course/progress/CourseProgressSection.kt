package eduflow.course.progress

interface CourseProgressSection : CourseProgressItem {
    val lessons: List<CourseProgressLesson>
}