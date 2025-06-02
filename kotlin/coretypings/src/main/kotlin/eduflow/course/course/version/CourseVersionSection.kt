package flowledge.course.course.version

interface CourseVersionSection : CourseVersionItem {
    val _id: String
    val lessons: List<CourseVersionLesson>?
}