package eduflow.admin

import eduflow.admin.registries.PermissionsRegistry
import eduflow.admin.types.SettingDetails
import eduflow.admin.registries.SettingsRegistry
import eduflow.privateSetting.SettingSelectOption
import eduflow.privateSetting.SettingType
import kotlinx.coroutines.runBlocking
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.CommandLineRunner
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

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

//        settingsRegistry.addGroup("user-default") {
//            addTab("appearance") {
//                addSetting("theme", "AUTO", SettingDetails(
//                    type = SettingType.SELECTOR_FINITE,
//                    public = true,
//                    options = listOf(
//                        SettingSelectOption("AUTO", "AUTO"),
//                        SettingSelectOption("DARK", "DARK"),
//                        SettingSelectOption("LIGHT", "LIGHT")
//                    )
//                )
//                )
//
//                addSetting("language", "EN", SettingDetails(
//                    type = SettingType.SELECTOR_INFINITE,
//                    public = true,
//                    options = listOf(
//                        SettingSelectOption("EN", "EN"),
//                        SettingSelectOption("RU", "RU")
//                    )
//                )
//                )
//            }
//        }


       runBlocking {
           settingsRegistry.addGroup("ldap") {
//               addSetting("enabled", false, SettingDetails(
//                   type = SettingType.RADIO,
//                   public = true
//               ))
              addSetting("map-groups-to-courses", "", SettingDetails(
                   type = SettingType.CODE,
               ))
//               addTab("connection") {
//                   addSetting("host", "", SettingDetails(
//                       type = SettingType.INPUT_TEXT,
//                       public = true,
//                   ))
//                   addSetting("port", 389, SettingDetails(
//                       type = SettingType.INPUT_NUMBER,
//                       public = true,
//                   ))
//               }
           }

//           settingsRegistry.addGroup("file-upload") {
//               addTab("stuff") {
//                   addSetting("task", "*", SettingDetails(
//                       type = SettingType.INPUT_TEXT,
//                   ))
//                   addSetting("presentation", "*", SettingDetails(
//                       type = SettingType.INPUT_TEXT,
//                   ))
//               }
//           }

//           settingsRegistry.addGroup("security") {
//               addSetting("link-restrictions", "[\"e.example.ru\"]", SettingDetails(
//                   type = SettingType.INPUT_TEXT,
//               ))
//           }
//           settingsRegistry.addGroup("search") {
//               addSetting("page-size", 10, SettingDetails(
//                   type = SettingType.INPUT_NUMBER,
//               ))
//           }
       }
    }
}

fun main(args: Array<String>) {
    runApplication<AdminApplication>(*args)
}
