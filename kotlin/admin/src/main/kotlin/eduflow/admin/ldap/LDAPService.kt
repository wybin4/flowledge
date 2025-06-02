package flowledge.admin.ldap

import flowledge.admin.services.SettingService
import flowledge.admin.utils.StringParser
import org.springframework.stereotype.Service

@Service
class LDAPService(private val settingService: SettingService) : StringParser {
    companion object {
        const val PREFIX = "ldap."
    }

    fun getUrl(): String {
        val host = settingService.getSetting("${PREFIX}connection.host", String::class)
        val port = settingService.getSetting("${PREFIX}connection.port", Int::class)

        val protocol = if (port == 636) "ldaps" else "ldap"
        return "$protocol://$host:$port"
    }

    fun isEnabled(): Boolean {
        return settingService.getSetting("${PREFIX}enabled", Boolean::class)
    }

    fun getAdminDn(): String {
        return settingService.getSetting("${PREFIX}auth.dn", String::class)
    }

    fun getAdminPassword(): String {
        return settingService.getSetting("${PREFIX}auth.password", String::class)
    }

    fun getUserDn(): String {
        return settingService.getSetting("${PREFIX}user.base-dn", String::class)
    }

    fun getUserSearchFilter(): String {
        return settingService.getSetting("${PREFIX}user.search-filter", String::class)
    }

    private fun getGroupBaseDn(): String {
        return settingService.getSetting("${PREFIX}group.base-dn", String::class)
    }

    fun extractGroupName(dn: String): String {
        return dn.replace(",${getGroupBaseDn()}", "").substringAfter("cn=")
    }

    fun getUserMappingGroupsToCoursesAndTags(userGroups: List<String>): List<String> {
        val mapping = getMappingGroupsToCoursesAndTags() as Map<String, List<String>>

        return userGroups
            .flatMap { group -> mapping[group] ?: emptyList() }
            .distinct()
    }

    private fun getMappingGroupsToCoursesAndTags(): Map<*, *> {
        val string = settingService.getSetting("${PREFIX}map-groups-to-courses", String::class)
        return parseJsonString(string, Map::class.java)
    }

}