package user

import (
	"context"
	"errors"
)

// Создание пользователя из payload
func (s *Service) CreateUserFromMap(payload map[string]interface{}) (*UserModel, error) {
	username, _ := payload["username"].(string)
	password, _ := payload["password"].(string)
	name, _ := payload["name"].(string)
	rolesIface, _ := payload["roles"].([]interface{})
	roles := make([]string, 0, len(rolesIface))
	for _, r := range rolesIface {
		if rs, ok := r.(string); ok {
			roles = append(roles, rs)
		}
	}

	if username == "" || password == "" {
		return nil, errors.New("username and password required")
	}

	return s.CreateUser(context.Background(), username, name, password, roles)
}

// Обновление пользователя из payload
func (s *Service) UpdateUserFromMap(id string, payload map[string]interface{}) (*UserModel, error) {
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
