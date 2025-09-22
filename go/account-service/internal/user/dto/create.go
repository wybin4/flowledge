package user_dto

type CreateUserRequest struct {
	Username string   `json:"username"`
	Name     string   `json:"name"`
	Password string   `json:"password"`
	Roles    []string `json:"roles,omitempty"`
}
