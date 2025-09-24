package user_service

import (
	"encoding/json"
	"time"

	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/google/uuid"
	user_model "github.com/wybin4/flowledge/go/account-service/internal/user/model"
)

type UserEventService struct {
	publisher message.Publisher
	topic     string
}

func NewUserEventService(publisher message.Publisher) *UserEventService {
	return &UserEventService{
		publisher: publisher,
		topic:     "user-events",
	}
}

func (s *UserEventService) SendUserEvent(action string, user *user_model.User) {
	if s.publisher == nil || user == nil {
		return
	}

	event := map[string]interface{}{
		"action": action,
		"record": map[string]interface{}{
			"id":       user.ID,
			"username": user.Username,
			"name":     user.Name,
			"roles":    user.Roles,
			"active":   user.Active,
		},
		"timestamp": time.Now(),
	}

	eventBytes, err := json.Marshal(event)
	if err != nil {
		return
	}

	msg := message.NewMessage(uuid.NewString(), eventBytes)
	s.publisher.Publish(s.topic, msg)
}
