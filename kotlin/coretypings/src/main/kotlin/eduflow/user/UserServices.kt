package flowledge.user

interface UserServices {
    val resume: ResumeService?
    val ldap: LDAPService?
    val password: PasswordService?
}