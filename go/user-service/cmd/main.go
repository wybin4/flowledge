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
	user "github.com/wybin4/flowledge/go/user-service/internal"
)

func main() {
	app := fx.New(
		fx.Provide(
			func() (*mongo.Client, error) {
				return mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://localhost:27017"))
			},
			func(client *mongo.Client) *user.Repository {
				return user.NewRepository(client, "flowledge")
			},
			user.NewUserPasswordService,
			func() watermill.LoggerAdapter {
				return watermill.NewStdLogger(true, true)
			},
			func(logger watermill.LoggerAdapter) (*kafka.Subscriber, error) {
				return kafka.NewSubscriber(
					kafka.SubscriberConfig{
						Brokers:       []string{"localhost:29092"},
						ConsumerGroup: "user-service-group",
						Unmarshaler:   kafka.DefaultMarshaler{},
					},
					logger,
				)
			},
			func(logger watermill.LoggerAdapter) (*kafka.Publisher, error) {
				return kafka.NewPublisher(
					kafka.PublisherConfig{
						Brokers:   []string{"localhost:29092"},
						Marshaler: kafka.DefaultMarshaler{},
					},
					logger,
				)
			},
			func(publisher *kafka.Publisher) *user.UserEventService {
				return user.NewUserEventService(publisher)
			},
			func(repo *user.Repository, ps *user.UserPasswordService, es *user.UserEventService) *user.Service {
				return user.NewService(repo, ps, es)
			},
		),
		fx.Invoke(func(
			lc fx.Lifecycle,
			service *user.Service,
			subscriber *kafka.Subscriber,
			publisher *kafka.Publisher,
			logger watermill.LoggerAdapter,
		) {
			lc.Append(fx.Hook{
				OnStart: func(ctx context.Context) error {
					go transport.StartServiceRouter(transport.RouterConfig{
						ServiceName:   "user-service",
						Topic:         "user.requests",
						ResponseTopic: "user.responses",
						Subscriber:    subscriber,
						Publisher:     publisher,
						Logger:        logger,
						Handler: func(ctx context.Context, req transport.Request) (interface{}, error) {
							switch req.Endpoint {
							case "users.get":
								var userIdentifier string

								if rawID, ok := req.Payload["id"]; ok {
									if idStr, ok := rawID.(string); ok && idStr != "" {
										userIdentifier = idStr
									}
								}

								if rawUsername, ok := req.Payload["username"]; ok {
									if usernameStr, ok := rawUsername.(string); ok && usernameStr != "" {
										userIdentifier = usernameStr
									}
								}

								if userIdentifier == "" {
									return nil, fmt.Errorf("either id or username must be provided")
								}

								return service.GetUser(ctx, userIdentifier)
							case "users.create":
								return service.CreateUserFromMap(req.Payload)
							default:
								log.Printf("⚠️ unknown endpoint: %s", req.Endpoint)
								return nil, nil
							}
						},
					})
					return nil
				},
			})
		}),
	)

	log.Println("\033[31mUser service starting...\033[0m")
	app.Run()
}
