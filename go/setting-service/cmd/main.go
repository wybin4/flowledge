package main

import (
	"context"
	"fmt"

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
					go transport.StartServiceRouter(transport.RouterConfig{
						ServiceName: "setting-service",
						Topic:       "setting.requests",
						Subscriber:  subscriber,
						Publisher:   publisher,
						Logger:      logger,
						Handler: func(ctx context.Context, req transport.Request) (interface{}, error) {
							switch req.Endpoint {
							case "settings.get-private":
								return service.GetPrivateSettings(ctx)
							case "settings.get-public":
								return service.GetPublicSettings(ctx)
							case "settings.set":
								idVal, ok := req.Payload["id"].(string)
								if !ok {
									return nil, fmt.Errorf("missing or invalid id in payload")
								}
								value, ok := req.Payload["value"]
								if !ok {
									return nil, fmt.Errorf("missing value in payload")
								}
								return service.SetSettings(ctx, idVal, value)
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

	app.Run()
}
