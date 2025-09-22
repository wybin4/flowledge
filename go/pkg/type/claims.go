package pkg_type

import "github.com/golang-jwt/jwt/v5"

type UserClaims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

type UserClaimsResponse struct {
	*UserClaims
	Roles []string
}
