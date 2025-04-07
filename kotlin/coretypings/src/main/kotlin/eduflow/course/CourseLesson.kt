package eduflow.course

interface CourseLesson {
    val _id: String
    val title: String
    val time: String
    val imageUrl: String?
    val sectionId: String?
    val courseId: String?
}