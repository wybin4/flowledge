package pkg_type

import "github.com/golang-jwt/jwt/v5"

type UserClaims struct {
	UserID   string   `json:"userId"`
	Username string   `json:"username"`
	Roles    []string `json:"roles"`
	jwt.RegisteredClaims
}
