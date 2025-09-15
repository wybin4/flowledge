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

// Login проверяет пользователя через LDAP, затем user-service
func (s *AuthService) Login(ctx context.Context, username, password string) (*UserTokens, error) {
	if username == "" || password == "" {
		return nil, errors.New("empty username or password")
	}

	var groups []string
	log.Println("pl1", s.LDAPAuthenticator.IsEnabled())
	// Проверяем LDAP
	if s.LDAPAuthenticator.IsEnabled() {
		userDN, ldapGroups, err := s.LDAPAuthenticator.Authenticate(username, password)
		if err != nil {
			log.Printf("LDAP authentication failed for %s: %v", username, err)
			return nil, err
		}
		groups = ldapGroups
		log.Printf("LDAP user %s authenticated, DN=%s, groups=%v", username, userDN, groups)
	}

	// Получаем пользователя из user-service
	user, err := s.UserClient.GetUserByUsername(ctx, username)

	if err != nil || user == nil {
		// Если нет — создаем нового
		user, err = s.UserClient.CreateUser(ctx, username, password)
		if err != nil {
			log.Printf("Failed to create user in user-service: %v", err)
			return nil, err
		}
	}

	// Генерируем токены
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
