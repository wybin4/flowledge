package user_service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/wybin4/flowledge/go/account-service/internal/user"
	user_dto "github.com/wybin4/flowledge/go/account-service/internal/user/dto"
	user_model "github.com/wybin4/flowledge/go/account-service/internal/user/model"
	"github.com/wybin4/flowledge/go/account-service/internal/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type UserService struct {
	repo     *user.UserRepository
	eventSvc *UserEventService
}

func NewUserService(repo *user.UserRepository, es *UserEventService) *UserService {
	return &UserService{
		repo:     repo,
		eventSvc: es,
	}
}

func (s *UserService) CountByUsername(ctx context.Context, searchQuery string) (int64, error) {
	return s.repo.CountByUsernameContainingIgnoreCase(ctx, searchQuery)
}

func (s *UserService) GetPaginatedAndSorted(ctx context.Context, payload map[string]interface{}) ([]user_model.User, error) {
	page, _ := payload["page"].(int)
	if page == 0 {
		page = 1
	}

	pageSize, _ := payload["pageSize"].(int)
	if pageSize == 0 {
		pageSize = 10
	}

	searchQuery, _ := payload["searchQuery"].(string)
	sortQuery, _ := payload["sortQuery"].(string)
	excludedIDs, _ := payload["excludedIds"].([]string)

	sortField := "createdAt"
	sortOrder := -1 // DESC
	if sortQuery != "" {
		parts := strings.Split(sortQuery, ":")
		sortField = parts[0]
		if len(parts) > 1 && parts[1] == "top" {
			sortOrder = 1
		}
	}

	filter := bson.M{}
	if searchQuery != "" {
		filter["username"] = bson.M{"$regex": searchQuery, "$options": "i"}
	}
	if len(excludedIDs) > 0 {
		filter["_id"] = bson.M{"$nin": excludedIDs}
	}

	opts := options.Find()
	opts.SetSkip(int64((page - 1) * pageSize))
	opts.SetLimit(int64(pageSize))
	opts.SetSort(bson.M{sortField: sortOrder})

	var users []user_model.User
	cursor, err := s.repo.Collection().Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	if err := cursor.All(ctx, &users); err != nil {
		return nil, err
	}

	return users, nil
}

func (s *UserService) GetUsers(ctx context.Context, req user_dto.UserGetRequest) ([]interface{}, error) {
	if req.IsSmall {
		users, err := s.repo.FindAllExcludingIDs(ctx, req.ExcludedIDs, req.SearchQuery, req.PageSize)
		if err != nil {
			return nil, err
		}

		res := make([]interface{}, len(users))
		for i, u := range users {
			res[i] = user_dto.UserGetSmallResponse{
				ID:       u.ID,
				Name:     u.Name,
				Username: u.Username,
				Avatar:   "", // TODO: добавить аватар
			}
		}
		return res, nil
	}

	options := map[string]interface{}{
		"page":        req.Page,
		"pageSize":    req.PageSize,
		"searchQuery": req.SearchQuery,
		"sortQuery":   req.SortQuery,
		"excludedIds": req.ExcludedIDs,
	}

	users, err := s.GetPaginatedAndSorted(ctx, options)
	if err != nil {
		return nil, err
	}

	res := make([]interface{}, len(users))
	for i, u := range users {
		res[i] = user_dto.UserGetBigResponse{
			ID:       u.ID,
			Name:     u.Name,
			Username: u.Username,
			Avatar:   "",
			Roles:    u.Roles,
			Active:   u.Active,
		}
	}
	return res, nil
}

func (s *UserService) GetUser(ctx context.Context, id string) (*user_model.User, error) {
	user, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to find user by id %s: %w", id, err)
	}

	if user == nil {
		return nil, fmt.Errorf("user with id %s not found", id)
	}

	return user, nil
}

func (s *UserService) SetUserSettings(ctx context.Context, userID, settingID string, value interface{}) error {
	user, err := s.repo.FindByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to find user: %w", err)
	}
	if user == nil {
		return fmt.Errorf("user not found")
	}

	switch settingID {
	case "theme":
		if theme, ok := value.(string); ok {
			user.Settings.Theme = theme
		} else {
			return fmt.Errorf("invalid value type for theme")
		}
	case "language":
		if lang, ok := value.(string); ok {
			user.Settings.Language = lang
		} else {
			return fmt.Errorf("invalid value type for language")
		}
	default:
		return fmt.Errorf("unknown setting id: %s", settingID)
	}

	if err := s.repo.Update(ctx, user); err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	go s.eventSvc.SendUserEvent("update", user)
	return nil
}

func (s *UserService) CreateUser(ctx context.Context, username, name string, password *user_model.Password, roles []string) (*user_model.User, error) {
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

	now := time.Now()
	user := &user_model.User{
		ID:        uuid.New().String(),
		CreatedAt: now,
		UpdatedAt: now,
		Username:  username,
		Name:      name,
		Roles:     roles,
		Active:    true,
		Settings: user_model.UserSettings{
			Theme:    "AUTO",
			Language: "EN",
		},
		Services: user_model.UserServices{
			Password: password,
		},
	}

	if err := s.repo.Create(ctx, user); err != nil {
		return nil, err
	}

	go s.eventSvc.SendUserEvent("create", user)

	return user, nil
}

func (s *UserService) UpdateUser(ctx context.Context, id string, input user_dto.UpdateUserRequest) (*user_model.User, error) {
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

func (s *UserService) GetByUsername(ctx context.Context, username string) (*user_model.User, error) {
	user, err := s.repo.FindByUsername(ctx, username)
	if err != nil {
		if errors.Is(err, utils.ErrUserNotFoundDB) {
			return nil, fmt.Errorf("user %q not found", username)
		}
		return nil, err
	}
	return user, nil
}

func (s *UserService) UpdateSettings(ctx context.Context, id string, settings map[string]interface{}) error {
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

func (s *UserService) DeleteUser(ctx context.Context, id string) error {
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
