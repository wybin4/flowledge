package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill-kafka/v2/pkg/kafka"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/fx"

	"github.com/mitchellh/mapstructure"
	auth_dto "github.com/wybin4/flowledge/go/account-service/internal/auth/dto"
	auth_provider "github.com/wybin4/flowledge/go/account-service/internal/auth/provider"
	auth_service "github.com/wybin4/flowledge/go/account-service/internal/auth/service"
	"github.com/wybin4/flowledge/go/account-service/internal/user"
	user_service "github.com/wybin4/flowledge/go/account-service/internal/user/service"
	store "github.com/wybin4/flowledge/go/pkg/db"
	"github.com/wybin4/flowledge/go/pkg/transport"
)

func main() {
	app := fx.New(
		fx.Provide(
			func() (*mongo.Client, error) {
				return mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://localhost:27017"))
			},
			func(client *mongo.Client) *user.UserRepository {
				return user.NewUserRepository(client, "flowledge")
			},
			func() watermill.LoggerAdapter {
				return watermill.NewStdLogger(true, true)
			},
			func(logger watermill.LoggerAdapter) (*kafka.Subscriber, error) {
				return kafka.NewSubscriber(
					kafka.SubscriberConfig{
						Brokers:       []string{"localhost:29092"},
						ConsumerGroup: "account-service-group",
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
			func(publisher *kafka.Publisher) *user_service.UserEventService {
				return user_service.NewUserEventService(publisher)
			},
			func(repo *user.UserRepository, es *user_service.UserEventService) *user_service.UserService {
				return user_service.NewUserService(repo, es)
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

			// LDAPSettingProvider (только настройки + кеш)
			func(client *transport.SettingsServiceClient, manager *transport.SettingsManager, sub *kafka.Subscriber) *auth_provider.LDAPSettingProvider {
				ldapSvc := auth_provider.NewLDAPSettingProvider(client, manager, sub)
				return ldapSvc
			},

			// LDAPService
			func(ldapSvc *auth_provider.LDAPSettingProvider) *auth_service.LDAPService {
				return auth_service.NewLDAPService(ldapSvc)
			},

			// JWT токены
			func(settings *transport.SettingsManager) auth_service.TokenService {
				return auth_service.NewJwtTokenService("supersecret", 15*time.Minute, 7*24*time.Hour)
			},
			auth_service.NewPasswordService,
			// AuthService
			func(repo *user.UserRepository, token auth_service.TokenService, userSvc *user_service.UserService, ldapAuth *auth_service.LDAPService, pwd *auth_service.PasswordService) *auth_service.AuthService {
				return auth_service.NewAuthService(repo, token, userSvc, ldapAuth, pwd)
			},
		),
		fx.Invoke(func(
			lc fx.Lifecycle,
			userService *user_service.UserService,
			authService *auth_service.AuthService,
			subscriber *kafka.Subscriber,
			publisher *kafka.Publisher,
			logger watermill.LoggerAdapter,
		) {
			lc.Append(fx.Hook{
				OnStart: func(ctx context.Context) error {
					go transport.StartServiceRouter(transport.RouterConfig{
						ServiceName:   "account-service",
						Topic:         "account.requests",
						ResponseTopic: "account.responses",
						Subscriber:    subscriber,
						Publisher:     publisher,
						Logger:        logger,
						Handler: func(ctx context.Context, req transport.Request) (interface{}, error) {
							switch req.Endpoint {
							case "users.get":
								var userID string
								if rawID, ok := req.Payload["id"]; ok {
									if idStr, ok := rawID.(string); ok && idStr != "" {
										userID = idStr
									}
								}

								if userID == "" {
									return nil, fmt.Errorf("id must be provided")
								}

								return userService.GetUser(ctx, userID)
							case "login":
								username, _ := req.Payload["username"].(string)
								password, _ := req.Payload["password"].(string)
								return authService.Login(ctx, username, password)

							case "register":
								var payload auth_dto.RegisterRequest
								if err := mapstructure.Decode(req.Payload, &payload); err != nil {
									return nil, fmt.Errorf("invalid register payload: %w", err)
								}

								return authService.Register(ctx, payload)

							case "refresh":
								refreshToken, _ := req.Payload["refreshToken"].(string)
								return authService.Refresh(ctx, refreshToken)
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
