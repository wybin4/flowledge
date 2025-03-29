package eduflow.admin.registries

import eduflow.admin.models.PermissionModel
import eduflow.admin.models.RoleModel
import eduflow.admin.repositories.PermissionRepository
import eduflow.admin.repositories.RoleRepository
import eduflow.role.RoleScope
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
            RoleModel("admin", "Users", "admin role", RoleScope.USERS),
            RoleModel("user", "Users", "user role", RoleScope.USERS),
            RoleModel("editor", "Users", "editor role", RoleScope.USERS),
            RoleModel("owner", "Courses", "owner role", RoleScope.COURSES),
            RoleModel("moderator", "Courses", "moderator role", RoleScope.COURSES),
            RoleModel("custom_role", "Courses", "custom role", RoleScope.COURSES)
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
            PermissionModel("view-private-settings", listOf("admin")),
            PermissionModel("edit-private-settings", listOf("admin")),
            PermissionModel("manage-permissions", listOf("admin")),

            PermissionModel("view-all-courses", listOf("admin")),
            PermissionModel("view-assigned-courses", listOf("moderator", "owner", "user")),
            PermissionModel("edit-assigned-courses", listOf("moderator", "owner")),
            PermissionModel("edit-all-courses", listOf("admin")),
            PermissionModel("delete-course", listOf("admin")),
            PermissionModel("delete-assigned-course", listOf("moderator", "owner")),

            PermissionModel("assign-users-to-course", listOf("admin", "owner")),
            PermissionModel("remove-users-from-course", listOf("admin", "owner")),

            PermissionModel("create-course", listOf("admin")),

            PermissionModel("view-own-stats", listOf("user")),
            PermissionModel("view-assigned-stats", listOf("admin", "moderator", "owner")),
            PermissionModel("view-all-stats", listOf("admin")),

            PermissionModel("view-all-integrations", listOf("admin")),
            PermissionModel("manage-integration", listOf("admin")),
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
