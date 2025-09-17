package user

import (
	"context"
)

func (s *UserService) UpdateUserFromMap(id string, payload map[string]interface{}) (*UserModel, error) {
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
