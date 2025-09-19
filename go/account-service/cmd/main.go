package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill-kafka/v2/pkg/kafka"
	"go.mongodb.org/mongo-driver/mongo"
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
			store.NewMongoClient,
			func(client *mongo.Client) *user.UserRepository {
				return user.NewUserRepository(client, "flowledge")
			},
			func() watermill.LoggerAdapter {
				return watermill.NewStdLogger(true, true)
			},
			transport.NewKafkaPublisher,
			func(logger watermill.LoggerAdapter) (*kafka.Subscriber, error) {
				return transport.NewKafkaSubscriber("account-service-group", logger)
			},

			func(publisher *kafka.Publisher) *user_service.UserEventService {
				return user_service.NewUserEventService(publisher)
			},

			func(repo *user.UserRepository, es *user_service.UserEventService) *user_service.UserService {
				return user_service.NewUserService(repo, es)
			},

			// --- MemoryStore для LDAPSettingProvider ---
			func() *store.MemoryStore[auth_provider.GetSettingResponse] {
				return store.NewMemoryStore[auth_provider.GetSettingResponse]()
			},

			// --- ResourceManager ---
			func(repo *store.MemoryStore[auth_provider.GetSettingResponse]) *transport.ResourceManager[auth_provider.GetSettingResponse] {
				return transport.NewResourceManager(repo)
			},

			// --- ServiceClient ---
			func(pub *kafka.Publisher, sub *kafka.Subscriber) *transport.ServiceClient[auth_provider.GetSettingResponse] {
				return transport.NewServiceClient[auth_provider.GetSettingResponse](pub, sub, "policy.requests", "policy.responses")
			},

			// --- LDAPSettingProvider ---
			func(
				client *transport.ServiceClient[auth_provider.GetSettingResponse],
				manager *transport.ResourceManager[auth_provider.GetSettingResponse],
				sub *kafka.Subscriber,
			) *auth_provider.LDAPSettingProvider {
				return auth_provider.NewLDAPSettingProvider(client, manager, sub)
			},

			// LDAPService
			func(ldapSvc *auth_provider.LDAPSettingProvider) *auth_service.LDAPService {
				return auth_service.NewLDAPService(ldapSvc)
			},

			// JWT токены
			func() auth_service.TokenService {
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
