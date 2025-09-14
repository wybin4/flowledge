package main

import (
	"context"
	"encoding/json"
	"log"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill-kafka/v2/pkg/kafka"
	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/ThreeDotsLabs/watermill/message/router/middleware"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/fx"

	user "github.com/wybin4/flowledge/go/user-service/internal"
)

func main() {
	app := fx.New(
		fx.Provide(
			// Mongo
			func() (*mongo.Client, error) {
				return mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://localhost:27017"))
			},
			// Репозиторий
			func(client *mongo.Client) *user.Repository {
				return user.NewRepository(client, "flowledge")
			},
			// Password сервис
			user.NewUserPasswordService,
			// Watermill logger
			func() watermill.LoggerAdapter {
				return watermill.NewStdLogger(true, true)
			},
			// Kafka Subscriber
			func(logger watermill.LoggerAdapter) (*kafka.Subscriber, error) {
				return kafka.NewSubscriber(
					kafka.SubscriberConfig{
						Brokers:       []string{"localhost:9092"},
						ConsumerGroup: "user-service-group",
						Unmarshaler:   kafka.DefaultMarshaler{}, // ✅ И здесь тоже
					},
					logger,
				)
			},
			// Kafka Publisher
			func(logger watermill.LoggerAdapter) (*kafka.Publisher, error) {
				return kafka.NewPublisher(
					kafka.PublisherConfig{
						Brokers:   []string{"localhost:9092"},
						Marshaler: kafka.DefaultMarshaler{},
					},
					logger,
				)
			},
			func(publisher *kafka.Publisher) *user.UserEventService {
				return user.NewUserEventService(publisher)
			},
			// User Service С event service
			func(repo *user.Repository, ps *user.UserPasswordService, es *user.UserEventService) *user.Service {
				return user.NewService(repo, ps, es) // ← передаем реальный event service
			},
		),
		fx.Invoke(func(
			lc fx.Lifecycle,
			subscriber *kafka.Subscriber,
			publisher *kafka.Publisher,
			service *user.Service,
			logger watermill.LoggerAdapter,
		) {
			lc.Append(fx.Hook{
				OnStart: func(ctx context.Context) error {
					go startWatermillRouter(subscriber, publisher, service, logger)
					return nil
				},
			})
		}),
	)

	app.Run()
}

func startWatermillRouter(
	subscriber *kafka.Subscriber,
	publisher *kafka.Publisher,
	service *user.Service,
	logger watermill.LoggerAdapter,
) {
	router, err := message.NewRouter(message.RouterConfig{}, logger)
	if err != nil {
		panic(err)
	}

	router.AddMiddleware(middleware.Retry{}.Middleware)
	router.AddMiddleware(middleware.Recoverer)

	// Обработчик запросов
	router.AddHandler(
		"user_request_handler",
		"user.requests", // слушаем этот топик
		subscriber,
		"gateway.responses", // отвечаем в этот топик
		publisher,
		func(msg *message.Message) ([]*message.Message, error) {
			var request struct {
				CorrelationID string                 `json:"correlation_id"`
				Service       string                 `json:"service"`
				Endpoint      string                 `json:"endpoint"`
				Payload       map[string]interface{} `json:"payload"`
			}

			if err := json.Unmarshal(msg.Payload, &request); err != nil {
				log.Printf("Failed to unmarshal request: %v", err)
				return nil, nil
			}

			// Проверяем что запрос для нашего сервиса
			if request.Service != "user-service" {
				return nil, nil
			}

			var response interface{}
			var err error

			switch request.Endpoint {
			case "users.get":
				id := request.Payload["id"].(string)
				response, err = service.GetUser(context.Background(), id)
			case "users.create":
				response, err = service.CreateUserFromMap(request.Payload)
			default:
				return nil, nil
			}

			// Формируем ответ
			responseMsg := map[string]interface{}{
				"correlation_id": request.CorrelationID,
				"payload":        response,
			}

			if err != nil {
				responseMsg["error"] = err.Error()
			}

			responseBytes, err := json.Marshal(responseMsg)
			if err != nil {
				return nil, err
			}

			return []*message.Message{message.NewMessage(watermill.NewUUID(), responseBytes)}, nil
		},
	)

	log.Println("User Service Watermill router starting...")
	if err := router.Run(context.Background()); err != nil {
		panic(err)
	}
}
