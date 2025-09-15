package transport

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/ThreeDotsLabs/watermill-kafka/v2/pkg/kafka"
	"github.com/ThreeDotsLabs/watermill/message"
)

// pendingRequest хранит канал для конкретного correlationID
type pendingRequest struct {
	respChan chan *message.Message
	timer    *time.Timer
}

// Client — универсальный Pub/Sub клиент
type Client struct {
	Publisher       *kafka.Publisher
	Subscriber      message.Subscriber
	Timeout         time.Duration
	responses       chan *message.Message
	pendingRequests sync.Map
	stopChan        chan struct{}
	topic           string
}

// NewClient создаёт новый Pub/Sub клиент и стартует единого consumer
func NewClient(pub *kafka.Publisher, sub message.Subscriber, topic string, timeout time.Duration) *Client {
	c := &Client{
		Publisher:  pub,
		Subscriber: sub,
		Timeout:    timeout,
		responses:  make(chan *message.Message, 100),
		stopChan:   make(chan struct{}),
		topic:      topic,
	}

	go c.consumeResponses()
	go c.processResponses()

	return c
}

// consumeResponses — единственный consumer для всех ответов
func (c *Client) consumeResponses() {
	ctx := context.Background()
	ch, err := c.Subscriber.Subscribe(ctx, c.topic)
	if err != nil {
		panic(fmt.Sprintf("failed to subscribe to %s: %v", c.topic, err))
	}

	for {
		select {
		case msg := <-ch:
			c.responses <- msg
		case <-c.stopChan:
			return
		}
	}
}

// processResponses — обработка всех входящих сообщений
func (c *Client) processResponses() {
	for msg := range c.responses {
		var r struct {
			CorrelationID string          `json:"correlation_id"`
			Payload       json.RawMessage `json:"payload"`
		}

		if err := json.Unmarshal(msg.Payload, &r); err != nil {
			msg.Nack()
			continue
		}

		if val, ok := c.pendingRequests.Load(r.CorrelationID); ok {
			req := val.(*pendingRequest)
			req.respChan <- msg
			c.pendingRequests.Delete(r.CorrelationID)
		}
		msg.Ack()
	}
}

// Close закрывает клиент
func (c *Client) Close() {
	close(c.stopChan)
}

// Request отправляет запрос и ждёт ответа
func (c *Client) Request(ctx context.Context, service string, endpoint string, payload interface{}, prefix string) (json.RawMessage, error) {
	correlationID := prefix + "-" + fmt.Sprint(time.Now().UnixNano())
	respChan := make(chan *message.Message, 1)

	timer := time.NewTimer(c.Timeout)
	c.pendingRequests.Store(correlationID, &pendingRequest{
		respChan: respChan,
		timer:    timer,
	})

	req := map[string]interface{}{
		"correlation_id": correlationID,
		"service":        service,
		"endpoint":       endpoint,
		"payload":        payload,
	}
	data, _ := json.Marshal(req)

	// Используем topic из Client
	if err := c.Publisher.Publish(c.topic, message.NewMessage(correlationID, data)); err != nil {
		c.pendingRequests.Delete(correlationID)
		return nil, err
	}

	select {
	case msg := <-respChan:
		return json.RawMessage(msg.Payload), nil
	case <-timer.C:
		c.pendingRequests.Delete(correlationID)
		return nil, fmt.Errorf("timeout waiting for %s", endpoint)
	case <-ctx.Done():
		c.pendingRequests.Delete(correlationID)
		return nil, ctx.Err()
	}
}
