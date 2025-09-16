package auth

import (
	"context"
	"errors"
	"log"
)

// AuthService отвечает за аутентификацию и токены
type AuthService struct {
	LDAPService       *LDAPServiceSettings
	LDAPAuthenticator *LDAPAuthenticator
	TokenService      TokenService
	UserClient        *UserServiceClient
}

// NewAuthService создаёт AuthService с зависимостями
func NewAuthService(token TokenService, userClient *UserServiceClient, ldapSvc *LDAPServiceSettings, ldapAuth *LDAPAuthenticator) *AuthService {
	return &AuthService{
		LDAPService:       ldapSvc,
		LDAPAuthenticator: ldapAuth,
		TokenService:      token,
		UserClient:        userClient,
	}
}

func isUserEmpty(u *User) bool {
	return u == nil || u.Username == "" // или Username == ""
}

// Login проверяет пользователя через LDAP, затем user-service
func (s *AuthService) Login(ctx context.Context, username, password string) (*UserTokens, error) {
	if username == "" || password == "" {
		return nil, errors.New("empty username or password")
	}

	var (
		groups []string
		userDN string
		ldapOK bool
		user   *User
		err    error
	)

	// --- 1. Пробуем LDAP ---
	if s.LDAPAuthenticator.IsEnabled() {
		userDN, groups, err = s.LDAPAuthenticator.Authenticate(username, password)
		if err == nil && userDN != "" {
			ldapOK = true
			log.Printf("LDAP user %s authenticated, DN=%s, groups=%v", username, userDN, groups)
		} else {
			log.Printf("LDAP authentication failed for %s: %v", username, err)
		}
	}

	// --- 2. Проверяем в базе ---
	user, err = s.UserClient.GetUserByUsername(ctx, username)
	if err != nil {
		log.Printf("Error querying user-service: %v", err)
	}

	switch {
	// Если пользователь найден в LDAP и его нет в базе → создаём
	case ldapOK && isUserEmpty(user):
		user, err = s.UserClient.CreateUser(ctx, username, password)
		if err != nil {
			log.Printf("Failed to create user in user-service: %v", err)
			return nil, err
		}

	// Если пользователь НЕ найден в LDAP, но есть в базе → пропускаем
	case !ldapOK && !isUserEmpty(user):
		log.Printf("User %s not found in LDAP, but exists in DB – skipping LDAP", username)

	// Если нет ни в LDAP, ни в базе → отказ
	case !ldapOK && isUserEmpty(user):
		return nil, errors.New("user not found in LDAP and database")
	}

	// --- 3. Генерация токенов ---
	jwt, refresh, err := s.TokenService.GenerateTokens(user)
	if err != nil {
		return nil, err
	}

	return &UserTokens{JwtToken: jwt, RefreshToken: refresh}, nil
}

// Refresh обновляет токены по refreshToken
func (s *AuthService) Refresh(ctx context.Context, refreshToken string) (*UserTokens, error) {
	claims, err := s.TokenService.ValidateToken(refreshToken)
	if err != nil {
		return nil, err
	}

	user, err := s.UserClient.GetUserByUsername(ctx, claims.Username)
	if err != nil {
		return nil, err
	}

	jwt, refresh, err := s.TokenService.GenerateTokens(user)
	if err != nil {
		return nil, err
	}

	return &UserTokens{JwtToken: jwt, RefreshToken: refresh}, nil
}
