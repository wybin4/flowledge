package transport

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill-kafka/v2/pkg/kafka"
	"github.com/ThreeDotsLabs/watermill/message"
	store "github.com/wybin4/flowledge/go/pkg/db"
)

type SettingEvent struct {
	Action  string         `json:"action"`
	Setting SettingPayload `json:"setting"`
}

type SettingPayload struct {
	ID    string      `json:"id"`
	Value interface{} `json:"value"`
}

// SettingsRepository уже есть — in-memory
// добавим методы для безопасного чтения/обновления локальной конфигурации

type SettingsManager struct {
	repo *store.MemoryStore[any] // id -> value
	mu   sync.RWMutex
}

func NewSettingsManager(repo *store.MemoryStore[any]) *SettingsManager {
	return &SettingsManager{repo: repo}
}

func (s *SettingsManager) Get(key string) (interface{}, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.repo.Get(key)
}

func (s *SettingsManager) Set(key string, value interface{}) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.repo.Set(key, value)
}

// UpdateFromEvent проверяет и обновляет значение
func (s *SettingsManager) UpdateFromEvent(evt SettingEvent) {
	if evt.Action != "update" {
		return
	}

	current, ok := s.Get(evt.Setting.ID)
	if ok && current != evt.Setting.Value {
		log.Printf("🔄 Updating setting %s: %v -> %v", evt.Setting.ID, current, evt.Setting.Value)
		s.Set(evt.Setting.ID, evt.Setting.Value)
	}
}

type SettingsServiceClient struct {
	Publisher  *kafka.Publisher
	Subscriber message.Subscriber
	Timeout    time.Duration
	Logger     watermill.LoggerAdapter
}

func NewSettingsServiceClient(pub *kafka.Publisher, sub message.Subscriber, logger watermill.LoggerAdapter) *SettingsServiceClient {
	return &SettingsServiceClient{
		Publisher:  pub,
		Subscriber: sub,
		Timeout:    5 * time.Second,
		Logger:     logger,
	}
}

func (c *SettingsServiceClient) GetSetting(ctx context.Context, key string) (interface{}, error) {
	correlationID := "getsetting-" + key + "-" + fmt.Sprint(time.Now().UnixNano())
	respChan := make(chan *message.Message, 1)

	ch, err := c.Subscriber.Subscribe(ctx, "setting.responses")
	if err != nil {
		return nil, err
	}
	go func() {
		for msg := range ch {
			var r struct {
				CorrelationID string          `json:"correlation_id"`
				Payload       json.RawMessage `json:"payload"`
			}
			if err := json.Unmarshal(msg.Payload, &r); err != nil {
				continue
			}
			if r.CorrelationID == correlationID {
				respChan <- msg
				break
			}
		}
	}()

	req := map[string]interface{}{
		"correlation_id": correlationID,
		"service":        "setting-service",
		"endpoint":       "settings.get",
		"payload": map[string]string{
			"key": key,
		},
	}
	data, _ := json.Marshal(req)
	if err := c.Publisher.Publish("setting.requests", message.NewMessage(correlationID, data)); err != nil {
		return nil, err
	}

	select {
	case msg := <-respChan:
		var resp struct {
			Key   string      `json:"key"`
			Value interface{} `json:"value"`
		}
		if err := json.Unmarshal(msg.Payload, &resp); err != nil {
			return nil, err
		}
		return resp.Value, nil
	case <-time.After(c.Timeout):
		return nil, fmt.Errorf("timeout waiting for setting-service")
	}
}
