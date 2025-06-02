package flowledge.admin.registries

import flowledge.admin.models.PermissionModel
import flowledge.admin.models.RoleModel
import flowledge.admin.repositories.PermissionRepository
import flowledge.admin.repositories.RoleRepository
import flowledge.role.RoleScope
import flowledge.user.DefaultRoles
import flowledge.user.toLowerCase
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
            .map { it.name }
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
                "edit-course",
                listOf(
                    DefaultRoles.ADMIN.toLowerCase(),
                    DefaultRoles.EDITOR.toLowerCase(),
                    DefaultRoles.OWNER.toLowerCase(),
                    DefaultRoles.MODERATOR.toLowerCase(),
                )
            ),
            PermissionModel(
                "delete-course",
                listOf(
                    DefaultRoles.ADMIN.toLowerCase(),
                    DefaultRoles.EDITOR.toLowerCase(),
                    DefaultRoles.OWNER.toLowerCase()
                )
            ),
            PermissionModel(
                "create-course", listOf(
                    DefaultRoles.ADMIN.toLowerCase(),
                    DefaultRoles.EDITOR.toLowerCase()
                )
            ),

            PermissionModel(
                "view-subscribers",
                listOf(
                    DefaultRoles.ADMIN.toLowerCase(),
                    DefaultRoles.EDITOR.toLowerCase(),
                    DefaultRoles.OWNER.toLowerCase(),
                    DefaultRoles.MODERATOR.toLowerCase()
                )
            ),
            PermissionModel(
                "manage-subscribers",
                listOf(
                    DefaultRoles.ADMIN.toLowerCase(),
                    DefaultRoles.EDITOR.toLowerCase(),
                    DefaultRoles.OWNER.toLowerCase()
                )
            ),

            PermissionModel("view-own-statistics", listOf(DefaultRoles.USER.toLowerCase())),
            PermissionModel(
                "view-course-statistics",
                listOf(
                    DefaultRoles.ADMIN.toLowerCase(),
                    DefaultRoles.EDITOR.toLowerCase(),
                    DefaultRoles.OWNER.toLowerCase(),
                    DefaultRoles.MODERATOR.toLowerCase()
                )
            ),

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
