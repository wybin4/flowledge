package flowledge.course.subscription.progress

interface CourseProgress {
    val sections: List<CourseProgressSection>
    val progress: Double?
}