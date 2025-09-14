package producer

import (
	"context"
	"log"
)

// EventService отвечает за отправку событий в Kafka
type EventService struct {
	producer *Producer
	topic    string
}

// NewEventService создает сервис с указанным Kafka топиком
func NewEventService(producer *Producer, topic string) *EventService {
	return &EventService{
		producer: producer,
		topic:    topic,
	}
}

// SendAsync отправляет событие асинхронно
func (s *EventService) SendAsync(key string, event interface{}) {
	if s.producer == nil || event == nil {
		return
	}
	go s.sendEvent(key, event)
}

// SendSync отправляет событие синхронно (если важна гарантированная доставка)
func (s *EventService) SendSync(key string, event interface{}) error {
	return s.sendEvent(key, event)
}

// приватный метод
func (s *EventService) sendEvent(key string, event interface{}) error {
	ctx := context.Background()
	if err := s.producer.Send(ctx, key, event); err != nil {
		log.Printf("Failed to send event (topic=%s, key=%s): %v", s.topic, key, err)
		return err
	}
	return nil
}
