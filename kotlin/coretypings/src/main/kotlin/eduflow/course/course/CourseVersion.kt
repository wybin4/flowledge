package eduflow.course.course

interface CourseVersion {
    val name: String
    val sections: List<CourseVersionSection>?
}