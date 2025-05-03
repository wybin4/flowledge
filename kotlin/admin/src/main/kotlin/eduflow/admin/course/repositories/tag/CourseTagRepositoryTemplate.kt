package eduflow.admin.course.repositories.tag

import eduflow.admin.course.models.CourseTagModel
import eduflow.admin.repositories.PaginationAndSortingRepository

interface CourseTagRepositoryTemplate : PaginationAndSortingRepository<CourseTagModel, String>