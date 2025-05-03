package eduflow.user

interface UserServices {
    val resume: ResumeService?
    val ldap: LDAPService?
}