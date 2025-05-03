package eduflow.admin.course.repositories.course

import eduflow.admin.course.models.CourseModel
import eduflow.admin.repositories.PaginationAndSortingRepository

interface CourseRepositoryTemplate : PaginationAndSortingRepository<CourseModel, String>