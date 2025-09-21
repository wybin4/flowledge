package auth_service

import (
	"context"
	"errors"
	"fmt"
	"log"

	auth_dto "github.com/wybin4/flowledge/go/account-service/internal/auth/dto"
	auth_type "github.com/wybin4/flowledge/go/account-service/internal/auth/type"
	"github.com/wybin4/flowledge/go/account-service/internal/user"
	user_model "github.com/wybin4/flowledge/go/account-service/internal/user/model"
	user_service "github.com/wybin4/flowledge/go/account-service/internal/user/service"
	"github.com/wybin4/flowledge/go/account-service/internal/utils"
)

type AuthService struct {
	LDAPService     *LDAPService
	TokenService    TokenService
	PasswordService *PasswordService
	UserRepository  *user.UserRepository
	UserService     *user_service.UserService
}

func NewAuthService(repo *user.UserRepository, token TokenService, userSvc *user_service.UserService, ldapAuth *LDAPService, pSvc *PasswordService) *AuthService {
	return &AuthService{
		UserRepository:  repo,
		LDAPService:     ldapAuth,
		TokenService:    token,
		UserService:     userSvc,
		PasswordService: pSvc,
	}
}

func (s *AuthService) Login(ctx context.Context, username, password string) (*auth_type.UserTokens, error) {
	if username == "" || password == "" {
		return nil, utils.ErrEmptyCredentials
	}

	var (
		userDN string
		groups []string
		user   *user_model.User
		ldapOK bool
		err    error
	)

	// --- 1. Пробуем LDAP ---
	if s.LDAPService.IsEnabled() {
		userDN, groups, err = s.LDAPService.Authenticate(username, password)
		if err != nil {
			switch utils.MapLdapError(err) {
			case utils.ErrInvalidCredentials:
				return nil, utils.ErrInvalidCredentials
			case utils.ErrUserNotFoundLDAP:
				log.Printf("LDAP: user %s not found", username)
			default:
				log.Printf("LDAP error: %v", err)
				return nil, utils.ErrLDAPConnection
			}
		} else if userDN != "" {
			ldapOK = true
			log.Printf("LDAP user %s authenticated, DN=%s, groups=%v", username, userDN, groups)
		}
	}

	// --- 2. Проверяем в базе ---
	if ldapOK {
		// Сначала проверяем, есть ли пользователь в базе
		user, err = s.UserService.GetByUsername(ctx, username)
		if err != nil && !errors.Is(err, utils.ErrUserNotFoundLDAP) {
			return nil, fmt.Errorf("failed to query user %s: %w", username, err)
		}

		if user == nil {
			// Если не найден → создаём нового LDAP-пользователя
			user, err = s.UserService.CreateUser(ctx, username, "", nil, []string{})
			if err != nil {
				return nil, fmt.Errorf("failed to create user from LDAP: %w", err)
			}
		}
	} else {
		// LDAP не найден → проверяем локального пользователя
		user, err = s.UserService.GetByUsername(ctx, username)
		if err != nil {
			return nil, fmt.Errorf("failed to query user %s: %w", username, err)
		}
		if user == nil || user.Services.Password == nil {
			return nil, utils.ErrInvalidCredentials
		}

		if !s.PasswordService.Compare(user.Services.Password.Bcrypt, password) {
			return nil, utils.ErrInvalidCredentials
		}
	}

	// --- 3. Генерация токенов ---
	jwt, refresh, err := s.TokenService.GenerateTokens(ctx, user, "")
	if err != nil {
		return nil, err
	}

	return &auth_type.UserTokens{
		JwtToken:     jwt,
		RefreshToken: refresh,
	}, nil
}

func (s *AuthService) Register(ctx context.Context, p auth_dto.RegisterRequest) (*user_model.User, error) {
	if p.Username == "" {
		return nil, fmt.Errorf("username must be provided")
	}
	if p.Password == "" {
		return nil, fmt.Errorf("password must be provided")
	}

	ok, err := s.UserService.GetByUsername(ctx, p.Username)
	if err != nil {
		return nil, fmt.Errorf("check user exists: %w", err)
	}
	if ok != nil {
		return nil, fmt.Errorf("user %q already exists", p.Username)
	}

	hash, err := s.PasswordService.Hash(p.Password)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}

	return s.UserService.CreateUser(ctx, p.Username, p.Name, &user_model.Password{Bcrypt: hash}, p.Roles)
}

func (s *AuthService) Refresh(ctx context.Context, refreshToken string) (*auth_type.UserTokens, error) {
	if refreshToken == "" {
		return nil, fmt.Errorf("refresh token must be provided")
	}

	claims, err := s.TokenService.ValidateToken(ctx, refreshToken)
	if err != nil {
		return nil, fmt.Errorf("invalid refresh token: %w", err)
	}

	user, err := s.UserRepository.FindByUsername(ctx, claims.Username)
	if err != nil {
		return nil, fmt.Errorf("failed to query user: %w", err)
	}

	jwt, refresh, err := s.TokenService.GenerateTokens(ctx, user, refreshToken)
	if err != nil {
		return nil, fmt.Errorf("failed to generate tokens: %w", err)
	}

	return &auth_type.UserTokens{
		JwtToken:     jwt,
		RefreshToken: refresh,
	}, nil
}
