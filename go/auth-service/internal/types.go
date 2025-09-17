package auth

type User struct {
	ID       string   `bson:"_id" json:"id"`
	Username string   `json:"username"`
	Groups   []string `json:"groups"`
}

type UserTokens struct {
	JwtToken     string `json:"jwtToken"`
	RefreshToken string `json:"refreshToken"`
}

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
