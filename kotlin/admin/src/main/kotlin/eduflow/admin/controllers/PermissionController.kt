package eduflow.admin.controllers

import eduflow.admin.models.PermissionModel
import eduflow.admin.models.RoleModel
import eduflow.admin.repositories.PermissionRepository
import eduflow.admin.repositories.RoleRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api")
class PermissionController(
    private val permissionsRepository: PermissionRepository,
    private val rolesRepository: RoleRepository
) {

    @GetMapping("/permissions.get")
    fun getPrivateSettings(): Flux<PermissionModel> {
        return permissionsRepository.findAll()
    }

    @GetMapping("/roles.get")
    fun getPublicSettings(): Flux<RoleModel> {
        return rolesRepository.findAll()
    }

    @PostMapping("/permissions.toggle-role")
    fun toggleRoleInPermission(@RequestParam id: String, @RequestParam value: String): Mono<ResponseEntity<Map<String, String>>> {
        return rolesRepository.findById(value)
            .flatMap { _ ->
                permissionsRepository.findById(id)
                    .flatMap { permission ->
                        val updatedRoles = if (value in permission.roles) {
                            permission.roles - value
                        } else {
                            permission.roles + value
                        }

                        val updatedPermission = permission.copy(roles = updatedRoles)
                        permissionsRepository.save(updatedPermission)
                            .thenReturn(ResponseEntity.ok(mapOf("status" to "success")))
                    }
            }
            .defaultIfEmpty(ResponseEntity.notFound().build())
    }



}
