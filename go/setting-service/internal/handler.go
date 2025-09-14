package setting

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	repo     *Repository
	eventSvc *SettingEventService
}

func NewHandler(repo *Repository, es *SettingEventService) *Handler {
	return &Handler{repo: repo, eventSvc: es}
}

func (h *Handler) GetPrivateSettings(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	settings, err := h.repo.FindAll(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, settings)
}

func (h *Handler) GetPublicSettings(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	settings, err := h.repo.FindAll(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var public []interface{}
	for _, s := range settings {
		if s.Public {
			public = append(public, s)
		}
	}

	c.JSON(http.StatusOK, public)
}

func (h *Handler) SetSettings(c *gin.Context) {
	var req SettingUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	updated, err := h.repo.UpdateValue(ctx, req.ID, req.Value)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	go h.eventSvc.SendSettingEvent("update", updated)

	c.JSON(http.StatusOK, updated)
}
