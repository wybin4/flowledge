package flowledge.admin.ldap

import org.springframework.security.ldap.userdetails.LdapUserDetails


class CustomLdapUserDetails(
    private val delegate: LdapUserDetails,
    rawAttributes: javax.naming.directory.Attributes
) : LdapUserDetails by delegate {

    val attributes: Map<String, List<String>> = buildMap {
        val attrEnum = rawAttributes.all
        while (attrEnum.hasMore()) {
            val attr = attrEnum.next()
            val id = attr.id
            val values = mutableListOf<String>()
            val valueEnum = attr.all
            while (valueEnum.hasMore()) {
                values.add(valueEnum.next().toString())
            }
            put(id, values)
        }
    }
}
