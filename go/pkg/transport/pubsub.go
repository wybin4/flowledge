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

// Client — универсальный Pub/Sub клиент с request/response топиками
type Client struct {
	Publisher       *kafka.Publisher
	Subscriber      message.Subscriber
	Timeout         time.Duration
	responses       chan *message.Message
	pendingRequests sync.Map
	stopChan        chan struct{}
	requestTopic    string
	responseTopic   string
}

// NewClient создаёт новый Pub/Sub клиент и запускает обработку ответов
func NewClient(pub *kafka.Publisher, sub message.Subscriber, requestTopic, responseTopic string, timeout time.Duration) *Client {
	c := &Client{
		Publisher:     pub,
		Subscriber:    sub,
		Timeout:       timeout,
		responses:     make(chan *message.Message, 100),
		stopChan:      make(chan struct{}),
		requestTopic:  requestTopic,
		responseTopic: responseTopic,
	}

	go c.consumeResponses()
	go c.processResponses()

	return c
}

// consumeResponses — подписка на топик с ответами
func (c *Client) consumeResponses() {
	ctx := context.Background()
	ch, err := c.Subscriber.Subscribe(ctx, c.responseTopic)
	if err != nil {
		panic(fmt.Sprintf("failed to subscribe to %s: %v", c.responseTopic, err))
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

// processResponses — обработка входящих сообщений-ответов
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

// Request отправляет запрос в requestTopic и ждёт ответа в responseTopic
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

	// Публикуем запрос в requestTopic
	if err := c.Publisher.Publish(c.requestTopic, message.NewMessage(correlationID, data)); err != nil {
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
