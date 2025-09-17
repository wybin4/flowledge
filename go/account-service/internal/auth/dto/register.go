package auth_dto

type RegisterRequest struct {
	Username string   `json:"username"`
	Name     string   `json:"name"`
	Password string   `json:"password"`
	Roles    []string `json:"roles,omitempty"`
}
