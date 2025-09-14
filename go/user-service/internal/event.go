package user

import "github.com/wybin4/flowledge/go/pkg/kafka/producer"

type UserEventService struct {
	eventService *producer.EventService
}

func NewUserEventService(eventService *producer.EventService) *UserEventService {
	return &UserEventService{eventService: eventService}
}

func (s *UserEventService) SendUserEvent(action string, user *UserModel) {
	if user == nil {
		return
	}

	producer := map[string]interface{}{
		"action": action,
		"user": map[string]interface{}{
			"id":       user.ID,
			"username": user.Username,
			"name":     user.Name,
			"roles":    user.Roles,
			"active":   user.Active,
		},
	}

	s.eventService.SendAsync(user.ID, producer)
}
