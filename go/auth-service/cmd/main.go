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
	"go.uber.org/fx"
)

func main() {
	app := fx.New(
		// === PROVIDERS ===
		fx.Provide(
			func() watermill.LoggerAdapter {
				return watermill.NewStdLogger(true, true)
			},

			func(logger watermill.LoggerAdapter) (*kafka.Subscriber, error) {
				return kafka.NewSubscriber(kafka.SubscriberConfig{
					Brokers:       []string{"localhost:9092"},
					ConsumerGroup: "auth-service-group",
					Unmarshaler:   kafka.DefaultMarshaler{},
				}, logger)
			},

			func(logger watermill.LoggerAdapter) (*kafka.Publisher, error) {
				return kafka.NewPublisher(kafka.PublisherConfig{
					Brokers:   []string{"localhost:9092"},
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
			func(pub *kafka.Publisher, sub *kafka.Subscriber, logger watermill.LoggerAdapter) *transport.SettingsServiceClient {
				return transport.NewSettingsServiceClient(pub, sub, logger)
			},

			// LDAPServiceSettings (только настройки + кеш)
			func(client *transport.SettingsServiceClient, manager *transport.SettingsManager, sub *kafka.Subscriber) *auth.LDAPServiceSettings {
				ldapSvc := auth.NewLDAPServiceSettings(client, manager)
				ldapSvc.SubscribeUpdates(sub)
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

			// AuthService
			func(token auth.TokenService, userClient *auth.UserServiceClient, ldapSvc *auth.LDAPServiceSettings, ldapAuth *auth.LDAPAuthenticator) *auth.AuthService {
				return auth.NewAuthService(token, userClient, ldapSvc, ldapAuth)
			},
		),

		// === INVOKES ===
		fx.Invoke(func(lc fx.Lifecycle, svc *auth.AuthService, sub *kafka.Subscriber, pub *kafka.Publisher, logger watermill.LoggerAdapter) {
			lc.Append(fx.Hook{
				OnStart: func(ctx context.Context) error {
					// Router для auth.requests
					go transport.StartServiceRouter(transport.RouterConfig{
						ServiceName: "auth-service",
						Topic:       "auth.requests",
						Subscriber:  sub,
						Publisher:   pub,
						Logger:      logger,
						Handler: func(ctx context.Context, req transport.Request) (interface{}, error) {
							switch req.Endpoint {
							case "login":
								username, _ := req.Payload["username"].(string)
								password, _ := req.Payload["password"].(string)
								return svc.Login(ctx, username, password)

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

	log.Println("Auth service starting...")
	app.Run()
}
