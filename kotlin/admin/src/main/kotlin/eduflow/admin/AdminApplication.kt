package flowledge.admin

import flowledge.admin.registries.PermissionsRegistry
import flowledge.admin.registries.SettingsRegistry
import kotlinx.coroutines.runBlocking
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.CommandLineRunner
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.cache.annotation.EnableCaching

@EnableCaching
@SpringBootApplication
class AdminApplication : CommandLineRunner {

    @Autowired
    private lateinit var settingsRegistry: SettingsRegistry

    @Autowired
    private lateinit var permissionsRegistry: PermissionsRegistry

    override fun run(vararg args: String?) {

        permissionsRegistry.initializeDefaultRolesAndPermissions()
            .doOnTerminate {
                println("Permissions initialization completed.")
            }
            .subscribe()

        runBlocking {
            settingsRegistry.initializeDefaultSettings()
            println("Settings initialization completed.")
        }

    }
}

fun main(args: Array<String>) {
    runApplication<AdminApplication>(*args)
}
