package user_dto

type CreateUserRequest struct {
	Username string   `json:"username" binding:"required"`
	Name     string   `json:"name"`
	Roles    []string `json:"roles"`
}
