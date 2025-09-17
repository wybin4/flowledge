package user_dto

type UpdateUserRequest struct {
	Username *string  `json:"username,omitempty"`
	Name     *string  `json:"name,omitempty"`
	Roles    []string `json:"roles,omitempty"`
	Active   *bool    `json:"active,omitempty"`
}
