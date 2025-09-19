package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill-kafka/v2/pkg/kafka"
	"github.com/gorilla/mux"
	"go.uber.org/fx"

	gateway "github.com/wybin4/flowledge/go/gateway-service/internal"
	gateway_provider "github.com/wybin4/flowledge/go/gateway-service/internal/provider"
	store "github.com/wybin4/flowledge/go/pkg/db"
	"github.com/wybin4/flowledge/go/pkg/transport"
)

func main() {
	app := fx.New(
		fx.Provide(
			// Logger
			func() watermill.LoggerAdapter {
				return watermill.NewStdLogger(true, true)
			},

			// Kafka Publisher
			func(logger watermill.LoggerAdapter) (*kafka.Publisher, error) {
				return kafka.NewPublisher(kafka.PublisherConfig{
					Brokers:   []string{"localhost:29092"},
					Marshaler: kafka.DefaultMarshaler{},
				}, logger)
			},

			// Kafka Subscriber
			func(logger watermill.LoggerAdapter) (*kafka.Subscriber, error) {
				return kafka.NewSubscriber(kafka.SubscriberConfig{
					Brokers:       []string{"localhost:29092"},
					ConsumerGroup: "gateway-group",
					Unmarshaler:   kafka.DefaultMarshaler{},
				}, logger)
			},

			// Memory store для пермишнов
			func() *store.MemoryStore[gateway_provider.GetPermissionResponse] {
				return store.NewMemoryStore[gateway_provider.GetPermissionResponse]()
			},

			// AccountClient
			fx.Annotate(
				func(pub *kafka.Publisher, sub *kafka.Subscriber) *transport.Client {
					return transport.NewClient(pub, sub, "account.requests", "account.responses", 10*time.Second)
				},
				fx.ResultTags(`name:"accountClient"`),
			),

			// PolicyClient с аннотацией
			fx.Annotate(
				func(pub *kafka.Publisher, sub *kafka.Subscriber) *transport.Client {
					return transport.NewClient(pub, sub, "policy.requests", "policy.responses", 10*time.Second)
				},
				fx.ResultTags(`name:"policyClient"`),
			),

			// PermissionsProvider с правильными тегами параметров
			fx.Annotate(
				func(policyClient *transport.Client, store *store.MemoryStore[gateway_provider.GetPermissionResponse]) *gateway_provider.PermissionsProvider {
					manager := transport.NewResourceManager(store)
					return gateway_provider.NewPermissionsProvider(policyClient, manager)
				},
				fx.ParamTags(`name:"policyClient"`, ``), // policyClient с тегом, store без
			),

			// GatewayHandler с правильными тегами параметров
			fx.Annotate(
				func(accountClient *transport.Client, policyClient *transport.Client) *gateway.GatewayHandler {
					return gateway.NewGatewayHandler(accountClient, policyClient)
				},
				fx.ParamTags(`name:"accountClient"`, `name:"policyClient"`),
			),

			// HTTP Router
			func() *mux.Router {
				return mux.NewRouter()
			},
		),

		// Register routes
		fx.Invoke(func(handler *gateway.GatewayHandler, router *mux.Router) {
			handler.RegisterRoutes(router)
		}),

		// Start HTTP server
		fx.Invoke(func(lc fx.Lifecycle, router *mux.Router) {
			lc.Append(fx.Hook{
				OnStart: func(ctx context.Context) error {
					go func() {
						log.Println("Gateway running on :8084")
						log.Fatal(http.ListenAndServe(":8084", router))
					}()
					return nil
				},
			})
		}),

		// Start loading permissions
		fx.Invoke(func(lc fx.Lifecycle, permProvider *gateway_provider.PermissionsProvider) {
			lc.Append(fx.Hook{
				OnStart: func(ctx context.Context) error {
					go permProvider.LoadPermissions()
					return nil
				},
			})
		}),
	)

	app.Run()
}
