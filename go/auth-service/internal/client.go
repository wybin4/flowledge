package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/ThreeDotsLabs/watermill-kafka/v2/pkg/kafka"
	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/wybin4/flowledge/go/pkg/transport"
)

// UserServiceClient обёртка над универсальным Pub/Sub клиентом
type UserServiceClient struct {
	client *transport.Client
}

// NewUserServiceClient создаёт нового клиента
func NewUserServiceClient(pub *kafka.Publisher, sub message.Subscriber) *UserServiceClient {
	c := transport.NewClient(pub, sub, "user.responses", 5*time.Second)
	return &UserServiceClient{
		client: c,
	}
}

// GetUserByUsername получает пользователя по username
func (c *UserServiceClient) GetUserByUsername(ctx context.Context, username string) (*User, error) {
	payload := map[string]string{
		"username": username,
	}

	raw, err := c.client.Request(ctx, "user-service", "users.get", payload, "getuser")

	if err != nil {
		return nil, err
	}

	var user User
	if err := json.Unmarshal(raw, &user); err != nil {
		return nil, fmt.Errorf("failed to unmarshal user: %w", err)
	}
	return &user, nil
}

// CreateUser создаёт пользователя (username + password)
func (c *UserServiceClient) CreateUser(ctx context.Context, username, password string) (*User, error) {
	payload := map[string]string{
		"username": username,
		"password": password,
	}

	raw, err := c.client.Request(ctx, "user-service", "users.create", payload, "createuser")
	if err != nil {
		return nil, err
	}

	var user User
	if err := json.Unmarshal(raw, &user); err != nil {
		return nil, fmt.Errorf("failed to unmarshal created user: %w", err)
	}
	return &user, nil
}

// Close закрывает клиент
func (c *UserServiceClient) Close() {
	c.client.Close()
}
