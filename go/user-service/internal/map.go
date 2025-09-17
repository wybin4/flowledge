package user

import (
	"context"
	"errors"

	model "github.com/wybin4/flowledge/go/pkg/types"
)

// Создание пользователя из payload
func (s *Service) CreateUserFromMap(payload map[string]interface{}) (*model.CreateUserResponse, error) {
	username, _ := payload["username"].(string)
	name, _ := payload["name"].(string)
	rolesIface, _ := payload["roles"].([]interface{})
	roles := make([]string, 0, len(rolesIface))
	for _, r := range rolesIface {
		if rs, ok := r.(string); ok {
			roles = append(roles, rs)
		}
	}

	if username == "" {
		return nil, errors.New("username required")
	}

	return s.CreateUser(context.Background(), username, name, roles)
}

// Обновление пользователя из payload
func (s *Service) UpdateUserFromMap(id string, payload map[string]interface{}) (*model.UserModel, error) {
	update := UpdateUserRequest{}

	if v, ok := payload["username"].(string); ok {
		update.Username = &v
	}
	if v, ok := payload["name"].(string); ok {
		update.Name = &v
	}
	if v, ok := payload["roles"].([]interface{}); ok {
		roles := make([]string, 0, len(v))
		for _, r := range v {
			if rs, ok := r.(string); ok {
				roles = append(roles, rs)
			}
		}
		update.Roles = roles
	}
	if v, ok := payload["active"].(bool); ok {
		update.Active = &v
	}

	return s.UpdateUser(context.Background(), id, update)
}
