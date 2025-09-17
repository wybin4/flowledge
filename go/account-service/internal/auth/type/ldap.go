package auth_type

type LdapConfig struct {
	Enabled          bool
	Host             string
	Port             int
	AdminDN          string
	AdminPassword    string
	UserBaseDN       string
	UserSearchFilter string
	GroupBaseDN      string
}
