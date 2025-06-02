package flowledge.course.course.version

interface CourseVersion {
    val _id: String
    val name: String
    val sections: List<CourseVersionSection>?
}