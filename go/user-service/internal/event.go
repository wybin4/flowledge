package user

import (
	"context"
	"log"

	"github.com/wybin4/flowledge/go/pkg/kafka"
)

// UserEventService отвечает за отправку событий о пользователях
type UserEventService struct {
	producer *kafka.Producer
	topic    string
}

// NewUserEventService создает сервис с указанным Kafka топиком
func NewUserEventService(producer *kafka.Producer, topic string) *UserEventService {
	return &UserEventService{
		producer: producer,
		topic:    topic,
	}
}

// SendAsync безопасно отправляет событие о пользователе в Kafka асинхронно
// SendAsync безопасно отправляет событие о пользователе в Kafka асинхронно
func (s *UserEventService) SendAsync(action string, user *UserModel) {
	if s.producer == nil || user == nil {
		return
	}

	// Создаем event синхронно (это быстро)
	event := map[string]interface{}{
		"action": action,
		"user": map[string]interface{}{
			"id":       user.ID,
			"username": user.Username,
			"name":     user.Name,
			"roles":    user.Roles,
			"active":   user.Active,
		},
	}

	// Только ОДНА горутина на отправку
	go s.sendEvent(user.ID, event)
}

// sendEvent приватный метод для отправки
func (s *UserEventService) sendEvent(key string, event map[string]interface{}) {
	ctx := context.Background()
	if err := s.producer.Send(ctx, key, event); err != nil {
		log.Println("Failed to send user event:", err)
	}
}
