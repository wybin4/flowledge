package auth

import (
	"context"
	"fmt"
	"log"

	model "github.com/wybin4/flowledge/go/pkg/types"
)

// AuthService отвечает за аутентификацию и токены
type AuthService struct {
	LDAPService       *LDAPServiceSettings
	LDAPAuthenticator *LDAPAuthenticator
	TokenService      TokenService
	UserClient        *UserServiceClient
	PasswordService   *UserPasswordService
	repo              *Repository
}

// NewAuthService создаёт AuthService с зависимостями
func NewAuthService(repo *Repository, token TokenService, userClient *UserServiceClient, ldapSvc *LDAPServiceSettings, ldapAuth *LDAPAuthenticator, pwd *UserPasswordService) *AuthService {
	return &AuthService{
		repo:              repo,
		LDAPService:       ldapSvc,
		LDAPAuthenticator: ldapAuth,
		TokenService:      token,
		UserClient:        userClient,
		PasswordService:   pwd,
	}
}

// --- общий метод для создания пользователя с паролем ---
func (s *AuthService) createUser(
	ctx context.Context,
	username, plainPassword string,
	payload map[string]interface{},
	failIfExists bool,
) (*model.UserModel, error) {
	if username == "" {
		return nil, ErrEmptyUsername
	}

	// хэшируем пароль только если он передан
	var passwordService *model.PasswordService
	if plainPassword != "" {
		hash, err := s.PasswordService.Hash(plainPassword)
		if err != nil {
			return nil, fmt.Errorf("failed to hash password: %w", err)
		}
		passwordService = &model.PasswordService{Bcrypt: hash}
	}

	// гарантируем наличие username в payload
	if payload == nil {
		payload = map[string]interface{}{"username": username}
	} else {
		payload["username"] = username
	}

	// создаём или достаём пользователя через UserClient
	resp, err := s.UserClient.RequestCreateUser(ctx, payload)
	if err != nil {
		return nil, fmt.Errorf("failed to create user via UserClient: %w", err)
	}
	if resp == nil || resp.UserModel == nil {
		return nil, fmt.Errorf("user not created: UserModel is nil")
	}

	user := resp.UserModel

	// если пользователь уже существует
	if resp.AlreadyExists {
		if failIfExists {
			return nil, fmt.Errorf("user %s already exists", username)
		}
		// возвращаем как есть, без изменения
		return user, nil
	}

	// если новый — добавляем только пароль, не трогая остальной пейлоад
	if passwordService != nil {
		if err := s.repo.UpdateField(ctx, user.ID, "services.password", passwordService); err != nil {
			return nil, fmt.Errorf("failed to update password in DB: %w", err)
		}
	}

	return user, nil
}

// --- Login с LDAP + fallback ---
func (s *AuthService) Login(ctx context.Context, username, password string) (*UserTokens, error) {
	if username == "" || password == "" {
		return nil, ErrEmptyCredentials
	}

	var (
		userDN string
		groups []string
		user   *model.UserModel
		ldapOK bool
		err    error
	)

	// --- 1. Пробуем LDAP ---
	if s.LDAPAuthenticator.IsEnabled() {
		userDN, groups, err = s.LDAPAuthenticator.Authenticate(username, password)
		if err != nil {
			switch mapLdapError(err) {
			case ErrInvalidCredentials:
				return nil, ErrInvalidCredentials
			case ErrUserNotFoundLDAP:
				log.Printf("LDAP: user %s not found", username)
			default:
				log.Printf("LDAP error: %v", err)
				return nil, ErrLDAPConnection
			}
		} else if userDN != "" {
			ldapOK = true
			log.Printf("LDAP user %s authenticated, DN=%s, groups=%v", username, userDN, groups)
		}
	}

	// --- 2. Проверяем в базе ---
	if ldapOK {
		user, err = s.createUser(ctx, username, "", map[string]interface{}{"username": username}, false)
		if err != nil {
			return nil, fmt.Errorf("failed to create user from LDAP: %w", err)
		}
	} else {
		// LDAP не найден → проверяем локального пользователя
		user, err = s.repo.FindByUsername(ctx, username)
		if err != nil {
			return nil, fmt.Errorf("failed to query user %s: %w", username, err)
		}
		if user == nil {
			return nil, ErrInvalidCredentials
		}

		if user.Services.Password == nil || !s.PasswordService.Compare(user.Services.Password.Bcrypt, password) {
			return nil, ErrInvalidCredentials
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

// --- Register (из админки) ---
func (s *AuthService) Register(ctx context.Context, username, plainPassword string, payload map[string]interface{}) (*model.UserModel, error) {
	if plainPassword == "" {
		return nil, ErrEmptyPassword
	}
	// используем общий метод для создания
	return s.createUser(ctx, username, plainPassword, payload, true)
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
	user, err := s.repo.FindByUsername(ctx, claims.Username)
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
