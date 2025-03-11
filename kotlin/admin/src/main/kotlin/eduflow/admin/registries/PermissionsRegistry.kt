package eduflow.admin.services

import eduflow.admin.models.PermissionModel
import eduflow.admin.models.RoleModel
import eduflow.admin.repositories.PermissionRepository
import eduflow.admin.repositories.RoleRepository
import eduflow.role.RoleScope
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class PermissionsService {

    @Autowired
    private lateinit var permissionRepository: PermissionRepository

    @Autowired
    private lateinit var roleRepository: RoleRepository

    fun initializeDefaultRolesAndPermissions(): Mono<Void> {
        return Mono.zip(
            addDefaultRoles(),
            addDefaultPermissions()
        ).then()
    }

    private fun addDefaultRoles(): Mono<Void> {
        val defaultRoles = listOf(
            RoleModel("admin", "Users", "Admin", RoleScope.USERS),
            RoleModel("user", "Users", "Regular User", RoleScope.USERS)
        )

        val roleSaves = defaultRoles.map { roleRepository.save(it) }

        return Mono.when(*roleSaves.toTypedArray()).then()
    }

    private fun addDefaultPermissions(): Mono<Void> {
        val defaultPermissions = listOf(
            PermissionModel("access-permissions", listOf("admin"))
        )

        val permissionSaves = defaultPermissions.map { permissionRepository.save(it) }

        return Mono.when(*permissionSaves.toTypedArray()).then()
    }

}
