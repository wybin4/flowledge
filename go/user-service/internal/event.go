package user

import (
	"encoding/json"
	"time"

	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/google/uuid"
)

type UserEventService struct {
	publisher message.Publisher // ✅ БЕЗ указателя!
	topic     string
}

func NewUserEventService(publisher message.Publisher) *UserEventService {
	return &UserEventService{
		publisher: publisher,
		topic:     "user-events",
	}
}

// SendUserEvent отправляет событие о пользователе через Watermill
func (s *UserEventService) SendUserEvent(action string, user *UserModel) {
	if s.publisher == nil || user == nil {
		return
	}

	event := map[string]interface{}{
		"action": action,
		"user": map[string]interface{}{
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
	s.publisher.Publish(s.topic, msg) // ✅ Теперь будет работать
}