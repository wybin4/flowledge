package transport

import (
	"context"
	"encoding/json"
	"log"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/ThreeDotsLabs/watermill/message/router/middleware"
)

// Структура запроса
type Request struct {
	CorrelationID string                 `json:"correlation_id"`
	Service       string                 `json:"service"`
	Endpoint      string                 `json:"endpoint"`
	Payload       map[string]interface{} `json:"payload"`
}

// Структура ответа
type Response map[string]interface{}

// Тип функции, которая обрабатывает эндпоинт
type EndpointHandler func(ctx context.Context, req Request) (interface{}, error)

// Конфиг для старта роутера
type RouterConfig struct {
	ServiceName string
	Topic       string
	Subscriber  message.Subscriber
	Publisher   message.Publisher
	Logger      watermill.LoggerAdapter
	Handler     EndpointHandler
}

// Универсальный запуск роутера
func StartServiceRouter(cfg RouterConfig) {
	router, err := message.NewRouter(message.RouterConfig{}, cfg.Logger)
	if err != nil {
		panic(err)
	}

	router.AddMiddleware(middleware.Retry{}.Middleware)
	router.AddMiddleware(middleware.Recoverer)

	router.AddHandler(
		cfg.ServiceName+"_handler",
		cfg.Topic,
		cfg.Subscriber,
		"gateway.responses",
		cfg.Publisher,
		func(msg *message.Message) ([]*message.Message, error) {
			var request Request
			if err := json.Unmarshal(msg.Payload, &request); err != nil {
				log.Printf("❌ Failed to unmarshal request: %v", err)
				return nil, nil
			}

			if request.Service != cfg.ServiceName {
				return nil, nil
			}

			response, err := cfg.Handler(msg.Context(), request)
			respMsg := Response{
				"correlation_id": request.CorrelationID,
				"payload":        response,
			}
			if err != nil {
				respMsg["error"] = err.Error()
			}

			respBytes, err := json.Marshal(respMsg)
			if err != nil {
				return nil, err
			}

			return []*message.Message{
				message.NewMessage(watermill.NewUUID(), respBytes),
			}, nil
		},
	)

	log.Printf("🚀 %s Watermill router starting...", cfg.ServiceName)
	if err := router.Run(context.Background()); err != nil {
		panic(err)
	}
}
