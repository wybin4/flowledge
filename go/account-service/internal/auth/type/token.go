package auth_type

type UserTokens struct {
	JwtToken     string `json:"jwtToken"`
	RefreshToken string `json:"refreshToken"`
}
