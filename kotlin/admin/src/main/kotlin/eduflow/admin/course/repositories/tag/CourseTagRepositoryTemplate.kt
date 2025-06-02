package flowledge.admin.course.repositories.tag

import flowledge.admin.course.models.CourseTagModel
import flowledge.admin.repositories.PaginationAndSortingRepository

interface CourseTagRepositoryTemplate : PaginationAndSortingRepository<CourseTagModel, String>