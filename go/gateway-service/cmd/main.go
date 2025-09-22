package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill-kafka/v2/pkg/kafka"
	"github.com/gorilla/mux"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.uber.org/fx"

	gateway "github.com/wybin4/flowledge/go/gateway-service/internal"
	gateway_provider "github.com/wybin4/flowledge/go/gateway-service/internal/provider"
	store "github.com/wybin4/flowledge/go/pkg/db"
	"github.com/wybin4/flowledge/go/pkg/transport"
)

func main() {
	app := fx.New(
		fx.Provide(
			func() watermill.LoggerAdapter {
				return watermill.NewStdLogger(true, true)
			},

			transport.NewKafkaPublisher,
			func(logger watermill.LoggerAdapter) (*kafka.Subscriber, error) {
				return transport.NewKafkaSubscriber("gateway-service-group", logger)
			},

			func() *store.MemoryStore[gateway_provider.GetPermissionResponse] {
				return store.NewMemoryStore[gateway_provider.GetPermissionResponse]()
			},

			fx.Annotate(
				func(pub *kafka.Publisher, sub *kafka.Subscriber) *transport.Client {
					return transport.NewClient(pub, sub, "account.requests", "account.responses", 10*time.Second)
				},
				fx.ResultTags(`name:"accountClient"`),
			),

			fx.Annotate(
				func(pub *kafka.Publisher, sub *kafka.Subscriber) *transport.Client {
					return transport.NewClient(pub, sub, "policy.requests", "policy.responses", 10*time.Second)
				},
				fx.ResultTags(`name:"policyClient"`),
			),

			fx.Annotate(
				func(policyClient *transport.Client, store *store.MemoryStore[gateway_provider.GetPermissionResponse]) *gateway_provider.PermissionsProvider {
					manager := transport.NewResourceManager(store)
					return gateway_provider.NewPermissionsProvider(policyClient, manager)
				},
				fx.ParamTags(`name:"policyClient"`, ``),
			),

			fx.Annotate(
				func(accountClient *transport.Client, policyClient *transport.Client, permProvider *gateway_provider.PermissionsProvider) *gateway.GatewayHandler {
					return gateway.NewGatewayHandler(accountClient, policyClient, permProvider)
				},
				fx.ParamTags(`name:"accountClient"`, `name:"policyClient"`),
			),

			func() *mux.Router {
				return mux.NewRouter()
			},
		),

		fx.Invoke(func(handler *gateway.GatewayHandler, router *mux.Router) {
			router.Handle("/metrics", promhttp.Handler())
			handler.RegisterRoutes(router)
		}),

		fx.Invoke(func(lc fx.Lifecycle, router *mux.Router) {
			lc.Append(fx.Hook{
				OnStart: func(ctx context.Context) error {
					go func() {
						port := os.Getenv("PORT")
						if port == "" {
							port = "8080"
						}
						addr := ":" + port
						log.Println("Gateway running on ", addr)
						log.Fatal(http.ListenAndServe(addr, router))
					}()
					return nil
				},
			})
		}),

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
