package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill-kafka/v2/pkg/kafka"
	auth "github.com/wybin4/flowledge/go/auth-service/internal"
	store "github.com/wybin4/flowledge/go/pkg/db"
	"github.com/wybin4/flowledge/go/pkg/transport"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/fx"
)

func main() {
	app := fx.New(
		// === PROVIDERS ===
		fx.Provide(
			func() (*mongo.Client, error) {
				return mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://localhost:27017"))
			},
			func(client *mongo.Client) *auth.Repository {
				return auth.NewRepository(client, "flowledge")
			},

			func() watermill.LoggerAdapter {
				return watermill.NewStdLogger(true, true)
			},

			func(logger watermill.LoggerAdapter) (*kafka.Subscriber, error) {
				return kafka.NewSubscriber(kafka.SubscriberConfig{
					Brokers:       []string{"localhost:29092"},
					ConsumerGroup: "auth-service-group",
					Unmarshaler:   kafka.DefaultMarshaler{},
				}, logger)
			},

			func(logger watermill.LoggerAdapter) (*kafka.Publisher, error) {
				return kafka.NewPublisher(kafka.PublisherConfig{
					Brokers:   []string{"localhost:29092"},
					Marshaler: kafka.DefaultMarshaler{},
				}, logger)
			},

			// In-memory store для локальных настроек
			func() *store.MemoryStore[any] {
				return store.NewMemoryStore[any]()
			},

			// Менеджер настроек с безопасным доступом
			func(repo *store.MemoryStore[any]) *transport.SettingsManager {
				return transport.NewSettingsManager(repo)
			},

			// Клиент сервиса настроек
			func(pub *kafka.Publisher, sub *kafka.Subscriber) *transport.SettingsServiceClient {
				return transport.NewSettingsServiceClient(pub, sub)
			},

			// LDAPServiceSettings (только настройки + кеш)
			func(client *transport.SettingsServiceClient, manager *transport.SettingsManager, sub *kafka.Subscriber) *auth.LDAPServiceSettings {
				ldapSvc := auth.NewLDAPServiceSettings(client, manager, sub)
				return ldapSvc
			},

			// LDAPAuthenticator
			func(ldapSvc *auth.LDAPServiceSettings) *auth.LDAPAuthenticator {
				return auth.NewLDAPAuthenticator(ldapSvc)
			},

			// JWT токены
			func(settings *transport.SettingsManager) auth.TokenService {
				return auth.NewJwtTokenService("supersecret", 15*time.Minute, 7*24*time.Hour)
			},

			// UserServiceClient
			func(pub *kafka.Publisher, sub *kafka.Subscriber) *auth.UserServiceClient {
				return auth.NewUserServiceClient(pub, sub)
			},
			auth.NewUserPasswordService,
			// AuthService
			func(repo *auth.Repository, token auth.TokenService, userClient *auth.UserServiceClient, ldapSvc *auth.LDAPServiceSettings, ldapAuth *auth.LDAPAuthenticator, pwd *auth.UserPasswordService) *auth.AuthService {
				return auth.NewAuthService(repo, token, userClient, ldapSvc, ldapAuth, pwd)
			},
		),

		// === INVOKES ===
		fx.Invoke(func(lc fx.Lifecycle, svc *auth.AuthService, sub *kafka.Subscriber, pub *kafka.Publisher, logger watermill.LoggerAdapter) {
			lc.Append(fx.Hook{
				OnStart: func(ctx context.Context) error {
					// Router для auth.requests
					go transport.StartServiceRouter(transport.RouterConfig{
						ServiceName:   "auth-service",
						Topic:         "auth.requests",
						ResponseTopic: "auth.responses",
						Subscriber:    sub,
						Publisher:     pub,
						Logger:        logger,
						Handler: func(ctx context.Context, req transport.Request) (interface{}, error) {
							switch req.Endpoint {
							case "login":
								username, _ := req.Payload["username"].(string)
								password, _ := req.Payload["password"].(string)
								return svc.Login(ctx, username, password)

							case "register":
								username, _ := req.Payload["username"].(string)
								password, _ := req.Payload["password"].(string)

								// Собираем payload с дополнительными полями
								payload := make(map[string]interface{})
								for k, v := range req.Payload {
									if k != "username" && k != "password" {
										payload[k] = v
									}
								}

								return svc.Register(ctx, username, password, payload)

							case "refresh":
								refreshToken, _ := req.Payload["refreshToken"].(string)
								return svc.Refresh(ctx, refreshToken)

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

	log.Println("\033[31mAuth service starting...\033[0m")
	app.Run()
}
