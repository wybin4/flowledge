package permission_service

import (
	"encoding/json"
	"time"

	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/google/uuid"
	"github.com/wybin4/flowledge/go/policy-service/internal/permission"
)

type PermissionEventService struct {
	publisher message.Publisher
	topic     string
}

func NewPermissionEventService(publisher message.Publisher) *PermissionEventService {
	return &PermissionEventService{
		publisher: publisher,
		topic:     "permission-events",
	}
}

func (s *PermissionEventService) SendPermissionEvent(action string, permission *permission.Permission) {
	if s.publisher == nil || permission == nil {
		return
	}

	event := map[string]interface{}{
		"action": action,
		"record": map[string]interface{}{
			"id":    permission.ID,
			"roles": permission.Roles,
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
