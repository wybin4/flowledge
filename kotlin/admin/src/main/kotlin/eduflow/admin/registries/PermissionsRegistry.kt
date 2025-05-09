package eduflow.admin.registries

import eduflow.admin.models.PermissionModel
import eduflow.admin.models.RoleModel
import eduflow.admin.repositories.PermissionRepository
import eduflow.admin.repositories.RoleRepository
import eduflow.role.RoleScope
import eduflow.user.DefaultRoles
import eduflow.user.toLowerCase
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class PermissionsRegistry {

    @Autowired
    private lateinit var permissionRepository: PermissionRepository

    @Autowired
    private lateinit var roleRepository: RoleRepository

    fun initializeDefaultRolesAndPermissions(): Mono<Void> {
        return addMissingRoles()
            .then(addMissingPermissions())
    }

    private fun addMissingRoles(): Mono<Void> {
        val defaultRoles = listOf(
            RoleModel(DefaultRoles.ADMIN.toLowerCase(), "Users", "admin role", listOf(RoleScope.USERS)),
            RoleModel(DefaultRoles.USER.toLowerCase(), "Users", "user role", listOf(RoleScope.USERS)),
            RoleModel(
                DefaultRoles.EDITOR.toLowerCase(),
                "Users",
                "editor role",
                listOf(RoleScope.USERS, RoleScope.COURSES)
            ),
            RoleModel(DefaultRoles.OWNER.toLowerCase(), "Courses", "owner role", listOf(RoleScope.COURSES)),
            RoleModel(DefaultRoles.MODERATOR.toLowerCase(), "Courses", "moderator role", listOf(RoleScope.COURSES)),
        )

        return roleRepository.findAll()
            .map { it.name }  // Получаем все существующие имена ролей
            .collectList()
            .flatMap { existingRoleNames ->
                val rolesToAdd = defaultRoles.filter { it.name !in existingRoleNames }
                if (rolesToAdd.isNotEmpty()) {
                    roleRepository.saveAll(rolesToAdd).collectList().then()
                } else {
                    Mono.empty()
                }
            }
    }

    private fun addMissingPermissions(): Mono<Void> {
        val defaultPermissions = listOf(
            PermissionModel(
                "view-private-settings",
                listOf(DefaultRoles.ADMIN.toLowerCase())
            ),
            PermissionModel(
                "edit-private-settings",
                listOf(DefaultRoles.ADMIN.toLowerCase())
            ),
            PermissionModel("view-all-permissions", listOf(DefaultRoles.ADMIN.toLowerCase())),
            PermissionModel("manage-permissions", listOf(DefaultRoles.ADMIN.toLowerCase())),

            PermissionModel(
                "view-all-courses", listOf(
                    DefaultRoles.ADMIN.toLowerCase(),
                    DefaultRoles.EDITOR.toLowerCase()
                )
            ),
            PermissionModel(
                "view-assigned-courses",
                listOf(
                    DefaultRoles.ADMIN.toLowerCase(),
                    DefaultRoles.EDITOR.toLowerCase(),
                    DefaultRoles.OWNER.toLowerCase(),
                    DefaultRoles.MODERATOR.toLowerCase(),
                    DefaultRoles.USER.toLowerCase()
                )
            ),
            PermissionModel(
                "edit-assigned-courses",
                listOf(
                    DefaultRoles.MODERATOR.toLowerCase(),
                    DefaultRoles.OWNER.toLowerCase(),
                    DefaultRoles.EDITOR.toLowerCase()
                )
            ),
            PermissionModel(
                "delete-assigned-course",
                listOf(DefaultRoles.EDITOR.toLowerCase(), DefaultRoles.OWNER.toLowerCase())
            ),

            PermissionModel(
                "create-course", listOf(
                    DefaultRoles.ADMIN.toLowerCase(),
                    DefaultRoles.EDITOR.toLowerCase()
                )
            ),
            PermissionModel("edit-all-courses", listOf(DefaultRoles.ADMIN.toLowerCase())),
            PermissionModel("delete-all-courses", listOf(DefaultRoles.ADMIN.toLowerCase())),

            PermissionModel(
                "manage-subscribers",
                listOf(DefaultRoles.ADMIN.toLowerCase(), DefaultRoles.OWNER.toLowerCase())
            ),

            PermissionModel("view-own-stats", listOf(DefaultRoles.USER.toLowerCase())),
            PermissionModel(
                "view-assigned-stats",
                listOf(
                    DefaultRoles.ADMIN.toLowerCase(),
                    DefaultRoles.EDITOR.toLowerCase(),
                    DefaultRoles.OWNER.toLowerCase(),
                    DefaultRoles.MODERATOR.toLowerCase()
                )
            ),
            PermissionModel("view-all-stats", listOf(DefaultRoles.ADMIN.toLowerCase())),

            PermissionModel(
                "view-tags",
                listOf(DefaultRoles.ADMIN.toLowerCase(), DefaultRoles.EDITOR.toLowerCase())
            ),
            PermissionModel("manage-tags", listOf(DefaultRoles.ADMIN.toLowerCase())),

            PermissionModel(
                "view-all-users",
                listOf(DefaultRoles.ADMIN.toLowerCase(), DefaultRoles.EDITOR.toLowerCase())
            ),
            PermissionModel("manage-users", listOf(DefaultRoles.ADMIN.toLowerCase())),

            PermissionModel("view-integrations", listOf(DefaultRoles.ADMIN.toLowerCase())),
            PermissionModel("manage-integrations", listOf(DefaultRoles.ADMIN.toLowerCase())),

            PermissionModel("manage-roles", listOf(DefaultRoles.ADMIN.toLowerCase())),
            PermissionModel(
                "manage-moderators",
                listOf(
                    DefaultRoles.ADMIN.toLowerCase(),
                    DefaultRoles.EDITOR.toLowerCase(),
                    DefaultRoles.OWNER.toLowerCase()
                )
            ),
            PermissionModel(
                "manage-owners",
                listOf(DefaultRoles.ADMIN.toLowerCase(), DefaultRoles.EDITOR.toLowerCase())
            )
        )

        return permissionRepository.findAll()
            .map { it._id }
            .collectList()
            .flatMap { existingPermissionIds ->
                val permissionsToAdd = defaultPermissions.filter { it._id !in existingPermissionIds }
                if (permissionsToAdd.isNotEmpty()) {
                    permissionRepository.saveAll(permissionsToAdd).collectList().then()
                } else {
                    Mono.empty()
                }
            }
    }
}
