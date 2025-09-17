package auth

import (
	"context"
	"errors"
	"fmt"
	"log"

	"github.com/wybin4/flowledge/go/account-service/internal/user"
	"github.com/wybin4/flowledge/go/account-service/internal/utils"
)

// AuthService отвечает за аутентификацию и токены
type AuthService struct {
	LDAPService       *LDAPServiceSettings
	LDAPAuthenticator *LDAPAuthenticator
	TokenService      TokenService
	PasswordService   *UserPasswordService
	UserRepository    *user.UserRepository
	UserService       *user.UserService
}

// NewAuthService создаёт AuthService с зависимостями
func NewAuthService(repo *user.UserRepository, token TokenService, userSvc *user.UserService, ldapSvc *LDAPServiceSettings, ldapAuth *LDAPAuthenticator, pSvc *UserPasswordService) *AuthService {
	return &AuthService{
		UserRepository:    repo,
		LDAPService:       ldapSvc,
		LDAPAuthenticator: ldapAuth,
		TokenService:      token,
		UserService:       userSvc,
		PasswordService:   pSvc,
	}
}

// --- Login с LDAP + fallback ---
func (s *AuthService) Login(ctx context.Context, username, password string) (*UserTokens, error) {
	if username == "" || password == "" {
		return nil, utils.ErrEmptyCredentials
	}

	var (
		userDN string
		groups []string
		user   *user.UserModel
		ldapOK bool
		err    error
	)

	// --- 1. Пробуем LDAP ---
	if s.LDAPAuthenticator.IsEnabled() {
		userDN, groups, err = s.LDAPAuthenticator.Authenticate(username, password)
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
	jwt, refresh, err := s.TokenService.GenerateTokens(user)
	if err != nil {
		return nil, err
	}

	return &UserTokens{
		JwtToken:     jwt,
		RefreshToken: refresh,
	}, nil
}

func (s *AuthService) Register(ctx context.Context, p RegisterRequest) (*user.UserModel, error) {
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

	return s.UserService.CreateUser(ctx, p.Username, p.Name, &user.Password{Bcrypt: hash}, p.Roles)
}

// Refresh обновляет токены по refreshToken
func (s *AuthService) Refresh(ctx context.Context, refreshToken string) (*UserTokens, error) {
	if refreshToken == "" {
		return nil, fmt.Errorf("refresh token must be provided")
	}

	// 1. Валидируем refresh token
	claims, err := s.TokenService.ValidateToken(refreshToken)
	if err != nil {
		return nil, fmt.Errorf("invalid refresh token: %w", err)
	}

	// 2. Получаем пользователя из базы
	user, err := s.UserRepository.FindByUsername(ctx, claims.Username)
	if err != nil {
		return nil, fmt.Errorf("failed to query user in DB: %w", err)
	}
	if user == nil {
		return nil, fmt.Errorf("user %s not found", claims.Username)
	}

	// 3. Генерация новых токенов
	jwt, refresh, err := s.TokenService.GenerateTokens(user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate tokens: %w", err)
	}

	return &UserTokens{
		JwtToken:     jwt,
		RefreshToken: refresh,
	}, nil
}
