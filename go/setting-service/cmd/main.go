package main

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill-kafka/v2/pkg/kafka"
	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/ThreeDotsLabs/watermill/message/router/middleware"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/fx"

	setting "github.com/wybin4/flowledge/go/setting-service/internal"
)

func main() {
	app := fx.New(
		fx.Provide(
			// Mongo
			func() (*mongo.Client, error) {
				return mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://localhost:27017"))
			},
			// Репозиторий
			func(client *mongo.Client) *setting.Repository {
				return setting.NewRepository(client, "flowledge")
			},
			func() watermill.LoggerAdapter {
				return watermill.NewStdLogger(true, true)
			},
			// Kafka Subscriber
			func(logger watermill.LoggerAdapter) (*kafka.Subscriber, error) {
				return kafka.NewSubscriber(
					kafka.SubscriberConfig{
						Brokers:       []string{"localhost:9092"},
						ConsumerGroup: "setting-service-group",
						Unmarshaler:   kafka.DefaultMarshaler{},
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
			// Event service
			func(publisher *kafka.Publisher) *setting.SettingEventService {
				return setting.NewSettingEventService(publisher)
			},
			// Setting service
			func(repo *setting.Repository, es *setting.SettingEventService) *setting.SettingService {
				return setting.NewSettingService(repo, es)
			},
		),
		fx.Invoke(func(
			lc fx.Lifecycle,
			service *setting.SettingService,
			subscriber *kafka.Subscriber,
			publisher *kafka.Publisher,
			logger watermill.LoggerAdapter,
		) {
			lc.Append(fx.Hook{
				OnStart: func(ctx context.Context) error {
					go startWatermillRouter(service, subscriber, publisher, logger)
					return nil
				},
			})
		}),
	)

	app.Run()
}

func startWatermillRouter(
	service *setting.SettingService,
	subscriber *kafka.Subscriber,
	publisher *kafka.Publisher,
	logger watermill.LoggerAdapter,
) {
	router, err := message.NewRouter(message.RouterConfig{}, logger)
	if err != nil {
		panic(err)
	}

	router.AddMiddleware(middleware.Retry{}.Middleware)
	router.AddMiddleware(middleware.Recoverer)

	router.AddHandler(
		"setting_request_handler",
		"setting.requests",
		subscriber,
		"gateway.responses",
		publisher,
		func(msg *message.Message) ([]*message.Message, error) {
			var request struct {
				CorrelationID string                 `json:"correlation_id"`
				Service       string                 `json:"service"`
				Endpoint      string                 `json:"endpoint"`
				Payload       map[string]interface{} `json:"payload"`
			}

			if err := json.Unmarshal(msg.Payload, &request); err != nil {
				logger.Error("Failed to unmarshal request", err, nil)
				return nil, nil
			}

			if request.Service != "setting-service" {
				return nil, nil
			}

			var response interface{}
			var err error

			switch request.Endpoint {
			case "settings.get-private":
				response, err = service.GetPrivateSettings(msg.Context())
			case "settings.get-public":
				response, err = service.GetPublicSettings(msg.Context())
			case "settings.set":
				idVal, ok := request.Payload["id"].(string)
				if !ok {
					err = fmt.Errorf("missing or invalid id in payload")
					break
				}
				value, ok := request.Payload["value"]
				if !ok {
					err = fmt.Errorf("missing value in payload")
					break
				}
				response, err = service.SetSettings(msg.Context(), idVal, value)
			default:
				return nil, nil
			}

			respMsg := map[string]interface{}{
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

			return []*message.Message{message.NewMessage(watermill.NewUUID(), respBytes)}, nil
		},
	)

	logger.Info("Setting Service Watermill router starting...", nil)
	if err := router.Run(context.Background()); err != nil {
		panic(err)
	}
}
