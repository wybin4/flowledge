package utils

import (
	"github.com/golang-jwt/jwt/v5"
	pkg_type "github.com/wybin4/flowledge/go/pkg/type"
)

func ParseClaims(tokenStr, secretKey string) (*pkg_type.UserClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &pkg_type.UserClaims{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(secretKey), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*pkg_type.UserClaims)
	if !ok || !token.Valid {
		return nil, jwt.ErrTokenInvalidClaims
	}

	return claims, nil
}
