package user

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	model "github.com/wybin4/flowledge/go/pkg/types"
)

type Service struct {
	repo     *Repository
	eventSvc *UserEventService
}

func NewService(repo *Repository, es *UserEventService) *Service {
	return &Service{
		repo:     repo,
		eventSvc: es,
	}
}

func (s *Service) GetUser(ctx context.Context, id string) (*model.UserModel, error) {
	user, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to find user by id %s: %w", id, err)
	}

	if user == nil {
		return nil, fmt.Errorf("user with id %s not found", id)
	}

	return user, nil
}

func (s *Service) CreateUser(ctx context.Context, username, name string, roles []string) (*model.CreateUserResponse, error) {
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

	// Проверяем, существует ли пользователь
	existingUser, err := s.repo.FindByUsername(ctx, username)
	if err != nil {
		return nil, err
	}
	if existingUser != nil {
		return &model.CreateUserResponse{
			UserModel:     existingUser,
			AlreadyExists: true,
		}, nil
	}

	now := time.Now()
	user := &model.UserModel{
		ID:        uuid.New().String(),
		CreatedAt: now,
		UpdatedAt: now,
		Username:  username,
		Name:      name,
		Roles:     roles,
		Active:    true,
		Settings: model.UserSettings{
			Theme:    "AUTO",
			Language: "EN",
		},
	}

	if err := s.repo.Create(ctx, user); err != nil {
		return nil, err
	}

	// шлём событие только для новых пользователей
	go s.eventSvc.SendUserEvent("create", user)

	return &model.CreateUserResponse{
		UserModel:     user,
		AlreadyExists: false,
	}, nil
}

func (s *Service) UpdateUser(ctx context.Context, id string, input UpdateUserRequest) (*model.UserModel, error) {
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

	user.UpdatedAt = time.Now()

	if err := s.repo.Update(ctx, user); err != nil {
		return nil, err
	}

	go s.eventSvc.SendUserEvent("update", user)

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

	go s.eventSvc.SendUserEvent("delete", user)

	return nil
}
