package transport

import (
	"context"
	"encoding/json"
	"log"
	"reflect"
	"sync"
	"time"

	"github.com/ThreeDotsLabs/watermill-kafka/v2/pkg/kafka"
	"github.com/ThreeDotsLabs/watermill/message"

	store "github.com/wybin4/flowledge/go/pkg/db"
)

// ================= Generic Resource Manager =================
type ResourceEvent[T any] struct {
	Action   string `json:"action"`
	Resource T      `json:"resource"`
}

type ResourceManager[T any] struct {
	repo *store.MemoryStore[T]
	mu   sync.RWMutex
}

func NewResourceManager[T any](repo *store.MemoryStore[T]) *ResourceManager[T] {
	return &ResourceManager[T]{repo: repo}
}

func (r *ResourceManager[T]) Get(key string) (T, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.repo.Get(key)
}

func (r *ResourceManager[T]) Set(key string, value T) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.repo.Set(key, value)
}

func (r *ResourceManager[T]) UpdateFromEvent(evt ResourceEvent[T], idFn func(T) string) {
	if evt.Action != "update" {
		return
	}

	key := idFn(evt.Resource)
	current, ok := r.Get(key)
	if !ok || !reflect.DeepEqual(current, evt.Resource) {
		log.Printf("Updating resource %s: %v -> %v", key, current, evt.Resource)
		r.Set(key, evt.Resource)
	}
}

// ================= Generic Service Client =================
type ServiceClient[T any] struct {
	client *Client
}

func NewServiceClient[T comparable](pub *kafka.Publisher, sub message.Subscriber, requestTopic, responseTopic string) *ServiceClient[T] {
	c := NewClient(pub, sub, requestTopic, responseTopic, 5*time.Second)
	return &ServiceClient[T]{client: c}
}

// Generic request — просто отсылает payload и возвращает сырые байты
func (c *ServiceClient[T]) Request(ctx context.Context, service, method string, payload interface{}) ([]byte, error) {
	return c.client.Request(ctx, service, method, payload, "generic")
}

func (c *ServiceClient[T]) SubscribeEvents(sub message.Subscriber, manager *ResourceManager[T], idFn func(T) string, topic string) {
	ch, err := sub.Subscribe(context.Background(), topic)
	if err != nil {
		log.Fatalf("failed to subscribe to %s: %v", topic, err)
	}

	go func() {
		for msg := range ch {
			var evt ResourceEvent[T]
			if err := json.Unmarshal(msg.Payload, &evt); err != nil {
				continue
			}
			manager.UpdateFromEvent(evt, idFn)
			msg.Ack()
		}
	}()
}

func (c *ServiceClient[T]) Close() {
	c.client.Close()
}
