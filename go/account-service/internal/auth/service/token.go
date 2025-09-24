package auth_service

import (
	"context"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/wybin4/flowledge/go/account-service/internal/user"
	user_model "github.com/wybin4/flowledge/go/account-service/internal/user/model"
	pkg_type "github.com/wybin4/flowledge/go/pkg/type"
	"github.com/wybin4/flowledge/go/pkg/utils"
)

type TokenService interface {
	GenerateTokens(ctx context.Context, user *user_model.User, oldRefreshToken string) (string, string, error)
	ValidateToken(ctx context.Context, tokenStr, tokenType string) (*pkg_type.UserClaims, error)
}

type JwtTokenService struct {
	secretKey      []byte
	accessTTL      time.Duration
	refreshTTL     time.Duration
	userRepository *user.UserRepository
}

func NewJwtTokenService(secret string, accessTTL, refreshTTL time.Duration, repo *user.UserRepository) *JwtTokenService {
	return &JwtTokenService{
		secretKey:      []byte(secret),
		accessTTL:      accessTTL,
		refreshTTL:     refreshTTL,
		userRepository: repo,
	}
}

func (j *JwtTokenService) GenerateTokens(ctx context.Context, user *user_model.User, oldRefreshToken string) (string, string, error) {
	now := time.Now()

	claims := pkg_type.UserClaims{
		UserID:   user.ID,
		Username: user.Username,
		Roles:    user.Roles,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(j.accessTTL)),
		},
	}

	accessToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(j.secretKey)
	if err != nil {
		return "", "", err
	}

	refreshClaims := pkg_type.UserClaims{
		UserID:   user.ID,
		Username: user.Username,
		Roles:    user.Roles,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(j.refreshTTL)),
		},
	}

	refreshToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims).SignedString(j.secretKey)
	if err != nil {
		return "", "", err
	}

	newResume := &user_model.Resume{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    now.Add(j.refreshTTL),
	}

	if oldRefreshToken != "" {
		newResumes := []*user_model.Resume{}
		for _, r := range user.Services.Resume {
			if r.RefreshToken != oldRefreshToken {
				newResumes = append(newResumes, r)
			}
		}
		user.Services.Resume = newResumes
	}

	user.Services.Resume = append(user.Services.Resume, newResume)

	if err := j.userRepository.Update(ctx, user); err != nil {
		return "", "", fmt.Errorf("failed to update user tokens: %w", err)
	}

	return accessToken, refreshToken, nil
}

func (j *JwtTokenService) ValidateToken(ctx context.Context, tokenStr, tokenType string) (*pkg_type.UserClaims, error) {
	claims, err := utils.ParseClaims(tokenStr, string(j.secretKey))
	if err != nil {
		return nil, err
	}

	user, err := j.userRepository.FindByUsername(ctx, claims.Username)
	if err != nil {
		return nil, fmt.Errorf("failed to query user: %w", err)
	}
	if user == nil {
		return nil, fmt.Errorf("user %s not found", claims.Username)
	}

	found := false
	for _, r := range user.Services.Resume {
		switch tokenType {
		case "access":
			if r.AccessToken == tokenStr {
				found = true
			}
		case "refresh":
			if r.RefreshToken == tokenStr {
				found = true
			}
		default:
			return nil, fmt.Errorf("unknown token type")
		}
		if found {
			break
		}
	}

	if !found {
		return nil, fmt.Errorf("token not active for user")
	}

	return &pkg_type.UserClaims{
		UserID:   user.ID,
		Username: user.Username,
		Roles:    user.Roles,
	}, nil
}
