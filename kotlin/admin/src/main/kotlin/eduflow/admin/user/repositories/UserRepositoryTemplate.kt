package eduflow.admin.user.repositories

import eduflow.admin.repositories.PaginationAndSortingRepository
import eduflow.admin.user.models.UserModel

interface UserRepositoryTemplate : PaginationAndSortingRepository<UserModel, String>