package user

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
)

type Service struct {
	repo            *Repository
	passwordService *UserPasswordService
	eventSvc        *UserEventService
}

func NewService(repo *Repository, ps *UserPasswordService, es *UserEventService) *Service {
	return &Service{
		repo:            repo,
		passwordService: ps,
		eventSvc:        es,
	}
}

func (s *Service) GetUser(ctx context.Context, id string) (*UserModel, error) {
	return s.repo.FindByID(ctx, id)
}

// CreateUser создает пользователя с дефолтными значениями и bcrypt-паролем
func (s *Service) CreateUser(ctx context.Context, username, name, plainPassword string, roles []string) (*UserModel, error) {
	username = strings.TrimSpace(username)
	if username == "" {
		return nil, errors.New("username cannot be empty")
	}
	if name == "" {
		name = username
	}
	if len(roles) == 0 {
		roles = []string{"user"}
	}

	var passwordService *PasswordService
	if plainPassword != "" {
		hash, err := s.passwordService.Hash(plainPassword)
		if err != nil {
			return nil, err
		}
		passwordService = &PasswordService{
			Bcrypt: hash,
		}
	}

	now := time.Now()
	user := &UserModel{
		ID:        uuid.New().String(),
		CreatedAt: now,
		UpdatedAt: now,
		Username:  username,
		Name:      name,
		Roles:     roles,
		Active:    true,
		Settings: UserSettings{
			Theme:    "AUTO",
			Language: "EN",
		},
		Services: UserServices{
			Password: passwordService,
		},
	}

	if err := s.repo.Create(ctx, user); err != nil {
		return nil, err
	}

	// потом шлём ивент
	go s.eventSvc.SendAsync("create", user)

	return user, nil
}

func (s *Service) UpdateUser(ctx context.Context, id string, input UpdateUserInput) (*UserModel, error) {
	user, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("user not found")
	}

	if input.Username != nil && *input.Username != user.Username {
		exists, err := s.repo.FindByUsername(ctx, *input.Username)
		if err != nil {
			return nil, err
		}
		if exists != nil && exists.ID != id {
			return nil, errors.New("username already exists")
		}
		user.Username = *input.Username
	}

	if input.Name != nil {
		user.Name = *input.Name
	}
	if input.Roles != nil {
		user.Roles = input.Roles
	}
	if input.Active != nil {
		user.Active = *input.Active
	}

	if input.Password != nil && *input.Password != "" {
		hash, err := s.passwordService.Hash(*input.Password)
		if err != nil {
			return nil, err
		}
		if user.Services.Password == nil {
			user.Services.Password = &PasswordService{}
		}
		user.Services.Password.Bcrypt = hash
	}

	user.UpdatedAt = time.Now()

	if err := s.repo.Update(ctx, user); err != nil {
		return nil, err
	}

	go s.eventSvc.SendAsync("update", user)

	return user, nil
}

func (s *Service) UpdateSettings(ctx context.Context, id string, settings map[string]interface{}) error {
	user, err := s.repo.FindByID(ctx, id)
	if err != nil || user == nil {
		return errors.New("user not found")
	}

	for k, v := range settings {
		switch k {
		case "theme":
			if theme, ok := v.(string); ok {
				user.Settings.Theme = theme
			}
		case "language":
			if lang, ok := v.(string); ok {
				user.Settings.Language = lang
			}
		}
	}

	return s.repo.Update(ctx, user)
}

func (s *Service) DeleteUser(ctx context.Context, id string) error {
	user, err := s.repo.FindByID(ctx, id)
	if err != nil || user == nil {
		return errors.New("user not found")
	}

	if err := s.repo.Delete(ctx, id); err != nil {
		return err
	}

	go s.eventSvc.SendAsync("delete", user)

	return nil
}
