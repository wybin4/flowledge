package eduflow.admin.ldap

import org.springframework.security.ldap.userdetails.LdapUserDetails
import javax.naming.directory.Attributes

class CustomLdapUserDetails(
    private val delegate: LdapUserDetails,
    val attributes: Attributes
) : LdapUserDetails by delegate