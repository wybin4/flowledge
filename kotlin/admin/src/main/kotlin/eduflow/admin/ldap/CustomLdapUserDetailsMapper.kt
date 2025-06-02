package flowledge.admin.ldap

import org.springframework.ldap.core.DirContextOperations
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.ldap.userdetails.LdapUserDetails
import org.springframework.security.ldap.userdetails.LdapUserDetailsMapper

class CustomLdapUserDetailsMapper : LdapUserDetailsMapper() {
    override fun mapUserFromContext(
        ctx: DirContextOperations,
        username: String,
        authorities: MutableCollection<out GrantedAuthority>
    ): UserDetails {
        val userDetails = super.mapUserFromContext(ctx, username, authorities)
        return CustomLdapUserDetails(userDetails as LdapUserDetails, ctx.attributes)
    }
}
