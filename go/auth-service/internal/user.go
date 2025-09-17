package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/ThreeDotsLabs/watermill-kafka/v2/pkg/kafka"
	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/wybin4/flowledge/go/pkg/transport"

	model "github.com/wybin4/flowledge/go/pkg/types"
)

// UserServiceClient обёртка над универсальным Pub/Sub клиентом
type UserServiceClient struct {
	client *transport.Client
}

// NewUserServiceClient создаёт нового клиента
func NewUserServiceClient(pub *kafka.Publisher, sub message.Subscriber) *UserServiceClient {
	c := transport.NewClient(pub, sub, "user.requests", "user.responses", 5*time.Second)
	return &UserServiceClient{
		client: c,
	}
}

func (c *UserServiceClient) RequestCreateUser(ctx context.Context, payload map[string]interface{}) (*model.CreateUserResponse, error) {
	if _, ok := payload["username"]; !ok || payload["username"] == "" {
		return nil, fmt.Errorf("username is required in payload")
	}

	// Отправляем запрос через транспорт
	raw, err := c.client.Request(ctx, "user-service", "users.create", payload, "createuser")
	if err != nil {
		return nil, fmt.Errorf("failed to request user creation via client: %w", err)
	}

	if len(raw) == 0 {
		return nil, fmt.Errorf("empty response from user service")
	}

	// Обёртка Kafka
	type kafkaWrapper struct {
		CorrelationID string          `json:"correlation_id"`
		Payload       json.RawMessage `json:"payload"`
	}

	var wrapper kafkaWrapper
	if err := json.Unmarshal(raw, &wrapper); err != nil {
		return nil, fmt.Errorf("failed to unmarshal Kafka wrapper: %w", err)
	}

	if len(wrapper.Payload) == 0 {
		return nil, fmt.Errorf("empty payload in Kafka response")
	}

	// Распаковываем реальный ответ CreateUserResponse
	var userResp model.CreateUserResponse
	if err := json.Unmarshal(wrapper.Payload, &userResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal CreateUserResponse payload: %w", err)
	}

	if userResp.UserModel == nil {
		return nil, fmt.Errorf("user not created: UserModel is nil")
	}

	return &userResp, nil
}

// Close закрывает клиент
func (c *UserServiceClient) Close() {
	c.client.Close()
}
