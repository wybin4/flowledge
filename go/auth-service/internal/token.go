package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	Username string   `json:"username"`
	Groups   []string `json:"groups"`
	jwt.RegisteredClaims
}

type TokenService interface {
	GenerateTokens(user *User) (string, string, error)
	ValidateToken(token string) (*Claims, error)
}

type JwtTokenService struct {
	secretKey  []byte
	accessTTL  time.Duration
	refreshTTL time.Duration
}

func NewJwtTokenService(secret string, accessTTL, refreshTTL time.Duration) *JwtTokenService {
	return &JwtTokenService{
		secretKey:  []byte(secret),
		accessTTL:  accessTTL,
		refreshTTL: refreshTTL,
	}
}

func (j *JwtTokenService) GenerateTokens(user *User) (string, string, error) {
	now := time.Now()

	claims := Claims{
		Username: user.Username,
		Groups:   user.Groups,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(j.accessTTL)),
		},
	}

	accessToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(j.secretKey)
	if err != nil {
		return "", "", err
	}

	refreshClaims := Claims{
		Username: user.Username,
		Groups:   user.Groups,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(j.refreshTTL)),
		},
	}

	refreshToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims).SignedString(j.secretKey)
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

func (j *JwtTokenService) ValidateToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		return j.secretKey, nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}
	return nil, jwt.ErrTokenInvalidClaims
}
