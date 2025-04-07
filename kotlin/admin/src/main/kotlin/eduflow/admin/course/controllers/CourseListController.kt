package eduflow.admin.course.controllers

import eduflow.admin.course.repositories.CourseRepository
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
class CourseListController(private val courseRepository: CourseRepository) {

}
