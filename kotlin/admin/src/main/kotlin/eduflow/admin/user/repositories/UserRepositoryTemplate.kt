package flowledge.admin.user.repositories

import flowledge.admin.repositories.PaginationAndSortingRepository
import flowledge.admin.user.models.UserModel

interface UserRepositoryTemplate : PaginationAndSortingRepository<UserModel, String>