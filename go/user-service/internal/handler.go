package user

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Handler ...
type Handler struct {
	service *Service
}

// NewHandler ...
func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// GetUser godoc
// @Summary Get user by ID
// @Description Retrieve a user by their ID
// @Tags users
// @Accept json
// @Produce json
// @Param id path string true "User ID or 'me'"
// @Success 200 {object} UserModel
// @Failure 404 {object} map[string]string
// @Router /users.get/{id} [get]
func (h *Handler) GetUser(c *gin.Context) {
	id := c.Param("id")
	user, err := h.service.GetUser(c.Request.Context(), id)
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

// createUserInput ...
type createUserInput struct {
	Username string   `json:"username" binding:"required"`
	Name     string   `json:"name"`
	Password string   `json:"password" binding:"required"`
	Roles    []string `json:"roles"`
}

// CreateUser godoc
// @Summary Create a new user
// @Description Create a user with username, password, name, and optional roles
// @Tags users
// @Accept json
// @Produce json
// @Param user body createUserInput true "User input"
// @Success 201 {object} UserModel
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /users.create [post]
func (h *Handler) CreateUser(c *gin.Context) {
	var input createUserInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.service.CreateUser(
		c.Request.Context(),
		input.Username,
		input.Name,
		input.Password,
		input.Roles,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, user)
}

// UpdateUserInput ...
type UpdateUserInput struct {
	Username *string  `json:"username,omitempty"`
	Name     *string  `json:"name,omitempty"`
	Roles    []string `json:"roles,omitempty"`
	Active   *bool    `json:"active,omitempty"`
	Password *string  `json:"password,omitempty"`
}

// UpdateUser godoc
// @Summary Update user details
// @Description Update a user's username, name, roles, active status or password
// @Tags users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Param user body UpdateUserInput true "Updated user data"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 409 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /users.update/{id} [put]
func (h *Handler) UpdateUser(c *gin.Context) {
	id := c.Param("id")

	var input UpdateUserInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.service.UpdateUser(c.Request.Context(), id, input)
	if err != nil {
		switch err.Error() {
		case "user not found":
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		case "username already exists":
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	response := gin.H{
		"_id":       user.ID,
		"username":  user.Username,
		"name":      user.Name,
		"roles":     user.Roles,
		"active":    user.Active,
		"settings":  user.Settings,
		"createdAt": user.CreatedAt,
		"updatedAt": user.UpdatedAt,
	}
	c.JSON(http.StatusOK, response)
}

// UpdateSettings godoc
// @Summary Update user settings
// @Description Update user settings like theme or language
// @Tags users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Param settings body map[string]interface{} true "Settings map"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /users/{id}/settings [put]
func (h *Handler) UpdateSettings(c *gin.Context) {
	id := c.Param("id")
	var settings map[string]interface{}
	if err := c.ShouldBindJSON(&settings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.service.UpdateSettings(c.Request.Context(), id, settings); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// DeleteUser godoc
// @Summary Delete a user
// @Description Delete a user by ID
// @Tags users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Success 204 {object} nil
// @Failure 404 {object} map[string]string
// @Router /users.delete/{id} [delete]
func (h *Handler) DeleteUser(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteUser(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}
