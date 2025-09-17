package transport

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/ThreeDotsLabs/watermill-kafka/v2/pkg/kafka"
	"github.com/ThreeDotsLabs/watermill/message"

	store "github.com/wybin4/flowledge/go/pkg/db"
)

// ================= Settings =================
type SettingEvent struct {
	Action  string         `json:"action"`
	Setting SettingPayload `json:"setting"`
}

type SettingPayload struct {
	ID    string      `json:"id"`
	Value interface{} `json:"value"`
}

// SettingsManager — менеджер настроек с безопасным доступом
type SettingsManager struct {
	repo *store.MemoryStore[any] // id -> value
	mu   sync.RWMutex
}

func NewSettingsManager(repo *store.MemoryStore[any]) *SettingsManager {
	return &SettingsManager{repo: repo}
}

// Get возвращает значение настройки
func (s *SettingsManager) Get(key string) (interface{}, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.repo.Get(key)
}

// Set сохраняет значение настройки
func (s *SettingsManager) Set(key string, value interface{}) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.repo.Set(key, value)
}

// UpdateFromEvent обновляет значение при событии
func (s *SettingsManager) UpdateFromEvent(evt SettingEvent) {
	if evt.Action != "update" {
		return
	}

	current, ok := s.Get(evt.Setting.ID)
	if !ok || current != evt.Setting.Value {
		log.Printf("🔄 Updating setting %s: %v -> %v", evt.Setting.ID, current, evt.Setting.Value)
		s.Set(evt.Setting.ID, evt.Setting.Value)
	}
}

// ================= SettingsServiceClient =================
type SettingsServiceClient struct {
	client *Client
}

func NewSettingsServiceClient(pub *kafka.Publisher, sub message.Subscriber) *SettingsServiceClient {
	c := NewClient(pub, sub, "policy.requests", "policy.responses", 5*time.Second)
	return &SettingsServiceClient{client: c}
}

func (c *SettingsServiceClient) GetSettingsByPattern(ctx context.Context, pattern string) (map[string]interface{}, error) {
	raw, err := c.client.Request(ctx, "policy-service", "settings.get", map[string]string{
		"pattern": pattern,
	}, "getsettings")
	if err != nil {
		return nil, err
	}

	var wrapper struct {
		Payload map[string]interface{} `json:"payload"`
	}
	if err := json.Unmarshal(raw, &wrapper); err != nil {
		return nil, fmt.Errorf("failed to unmarshal settings: %w", err)
	}
	return wrapper.Payload, nil
}

// SubscribeEvents подписывается на события обновления
func (c *SettingsServiceClient) SubscribeEvents(sub message.Subscriber, manager *SettingsManager) {
	ch, err := sub.Subscribe(context.Background(), "setting-events")
	if err != nil {
		log.Fatalf("failed to subscribe to setting-events: %v", err)
	}

	go func() {
		for msg := range ch {
			var evt SettingEvent
			if err := json.Unmarshal(msg.Payload, &evt); err != nil {
				continue
			}
			manager.UpdateFromEvent(evt)
			msg.Ack()
		}
	}()
}

// Close закрывает клиент
func (c *SettingsServiceClient) Close() {
	c.client.Close()
}
