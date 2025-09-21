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

type pendingRequest struct {
	respChan chan *message.Message
	timer    *time.Timer
}

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

func (c *Client) Request(ctx context.Context, service, endpoint string, payload interface{}) (json.RawMessage, error) {
	correlationID := fmt.Sprintf("%s-%d", GetPodID(), time.Now().UnixNano())
	respChan := make(chan *message.Message, 1)

	timer := time.NewTimer(c.Timeout)
	defer timer.Stop()

	c.pendingRequests.Store(correlationID, &pendingRequest{
		respChan: respChan,
		timer:    timer,
	})

	defer c.pendingRequests.Delete(correlationID)

	req := map[string]interface{}{
		"correlation_id": correlationID,
		"service":        service,
		"endpoint":       endpoint,
		"payload":        payload,
	}

	data, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	msg := message.NewMessage(correlationID, data)
	if err := c.Publisher.Publish(c.requestTopic, msg); err != nil {
		return nil, fmt.Errorf("failed to publish message: %w", err)
	}

	select {
	case responseMsg := <-respChan:
		var response struct {
			Payload json.RawMessage `json:"payload"`
			Error   string          `json:"error"`
		}

		if err := json.Unmarshal(responseMsg.Payload, &response); err != nil {
			return nil, fmt.Errorf("failed to unmarshal response: %w", err)
		}
		if response.Error != "" {
			return nil, fmt.Errorf(response.Error)
		}
		return response.Payload, nil

	case <-timer.C:
		return nil, fmt.Errorf("timeout waiting for %s", endpoint)

	case <-ctx.Done():
		return nil, ctx.Err()
	}
}
