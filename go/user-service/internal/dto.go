package user

type CreateUserRequest struct {
	Username string   `json:"username" binding:"required"`
	Name     string   `json:"name"`
	Roles    []string `json:"roles"`
}

type UpdateUserRequest struct {
	Username *string  `json:"username,omitempty"`
	Name     *string  `json:"name,omitempty"`
	Roles    []string `json:"roles,omitempty"`
	Active   *bool    `json:"active,omitempty"`
}
