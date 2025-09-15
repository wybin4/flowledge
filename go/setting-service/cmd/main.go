package main

import (
	"context"
	"fmt"
	"log"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill-kafka/v2/pkg/kafka"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/fx"

	"github.com/wybin4/flowledge/go/pkg/transport"
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
			// Watermill logger
			func() watermill.LoggerAdapter {
				return watermill.NewStdLogger(true, true)
			},
			// Kafka Subscriber
			func(logger watermill.LoggerAdapter) (*kafka.Subscriber, error) {
				return kafka.NewSubscriber(
					kafka.SubscriberConfig{
						Brokers:       []string{"localhost:29092"},
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
						Brokers:   []string{"localhost:29092"},
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
					// публичные (через gateway)
					go transport.StartServiceRouter(transport.RouterConfig{
						ServiceName:   "setting-service",
						Topic:         "setting.requests",
						ResponseTopic: "setting.responses", // каждый сервис отвечает в свой топик
						Subscriber:    subscriber,
						Publisher:     publisher,
						Logger:        logger,
						Handler: func(ctx context.Context, req transport.Request) (interface{}, error) {
							switch req.Endpoint {
							case "settings.get-private":
								return service.GetPrivateSettings(ctx)
							case "settings.get-public":
								return service.GetPublicSettings(ctx)
							case "settings.set":
								idVal, _ := req.Payload["id"].(string)
								value := req.Payload["value"]
								return service.SetSettings(ctx, idVal, value)
							case "settings.get":
								pattern, _ := req.Payload["pattern"].(string)
								return service.GetSettingsByPattern(ctx, pattern)
							default:
								return nil, fmt.Errorf("unknown endpoint: %s", req.Endpoint)
							}
						},
					})

					return nil
				},
			})
		}),
	)

	log.Println("\033[31mSetting service starting...\033[0m")
	app.Run()
}
