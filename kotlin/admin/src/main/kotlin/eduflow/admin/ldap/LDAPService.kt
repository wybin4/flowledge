package eduflow.admin.ldap

import eduflow.admin.services.SettingService
import org.springframework.stereotype.Service

@Service
class LDAPService(private val settingService: SettingService) {
    fun getLdapUrl(): String {
        val host = settingService.getSetting("ldap.connection.host", String::class)
        val port = settingService.getSetting("ldap.connection.port", Int::class)

        val protocol = if (port == 636) "ldaps" else "ldap"
        return "$protocol://$host:$port"
    }

    fun isLdapEnabled(): Boolean {
        return settingService.getSetting("ldap.enabled", Boolean::class)
    }

    fun getLdapAdminDn(): String {
        return settingService.getSetting("ldap.auth.dn", String::class)
    }

    fun getLdapAdminPassword(): String {
        return settingService.getSetting("ldap.auth.password", String::class)
    }

    fun getLdapUserDnPattern(): String {
        return settingService.getSetting("ldap.user.dn-pattern", String::class)
    }

    fun getLdapUserSearchFilter(): String {
        return settingService.getSetting("ldap.user.search-filter", String::class)
    }

    private fun getGroupBaseDn(): String {
        return settingService.getSetting("ldap.group.base-dn", String::class)
    }

    fun extractGroupName(dn: String): String {
        return dn.replace(",${getGroupBaseDn()}", "").substringAfter("cn=")
    }
}