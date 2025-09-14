package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/ThreeDotsLabs/watermill-kafka/v2/pkg/kafka"
	"github.com/ThreeDotsLabs/watermill/message"
)

type UserServiceClient struct {
	Publisher  *kafka.Publisher
	Subscriber message.Subscriber
	Timeout    time.Duration
}

func NewUserServiceClient(pub *kafka.Publisher, sub message.Subscriber) *UserServiceClient {
	return &UserServiceClient{
		Publisher:  pub,
		Subscriber: sub,
		Timeout:    5 * time.Second,
	}
}

func (c *UserServiceClient) GetUserByUsername(ctx context.Context, username string) (*User, error) {
	correlationID := "getuser-" + username + "-" + fmt.Sprint(time.Now().UnixNano())
	respChan := make(chan *message.Message, 1)

	ch, err := c.Subscriber.Subscribe(ctx, "user.responses")
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
		"service":        "user-service",
		"endpoint":       "users.get",
		"payload": map[string]string{
			"username": username,
		},
	}
	data, _ := json.Marshal(req)

	// Отправляем в Kafka через Publisher из watermill-kafka
	if err := c.Publisher.Publish("user.requests", message.NewMessage(correlationID, data)); err != nil {
		return nil, err
	}

	select {
	case msg := <-respChan:
		var user User
		if err := json.Unmarshal(msg.Payload, &user); err != nil {
			return nil, err
		}
		return &user, nil
	case <-time.After(c.Timeout):
		return nil, fmt.Errorf("timeout waiting for user-service")
	}
}

func (c *UserServiceClient) CreateUser(ctx context.Context, username string, groups []string) (*User, error) {
	correlationID := "createuser-" + username + "-" + fmt.Sprint(time.Now().UnixNano())
	respChan := make(chan *message.Message, 1)

	ch, err := c.Subscriber.Subscribe(ctx, "user.responses")
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
		"service":        "user-service",
		"endpoint":       "users.create",
		"payload": map[string]interface{}{
			"username": username,
			"groups":   groups,
		},
	}
	data, _ := json.Marshal(req)

	if err := c.Publisher.Publish("user.requests", message.NewMessage(correlationID, data)); err != nil {
		return nil, err
	}

	select {
	case msg := <-respChan:
		var user User
		if err := json.Unmarshal(msg.Payload, &user); err != nil {
			return nil, err
		}
		return &user, nil
	case <-time.After(c.Timeout):
		return nil, fmt.Errorf("timeout waiting for user-service")
	}
}
