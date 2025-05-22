package eduflow.course.progress

interface CourseProgress {
    val _id: String
    val courseId: String
    val courseVersion: String
    val sections: List<CourseProgressSection>
}