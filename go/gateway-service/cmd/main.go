package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill-kafka/v2/pkg/kafka"
	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/gorilla/mux"

	gateway "github.com/wybin4/flowledge/go/gateway-service/internal"
	gateway_provider "github.com/wybin4/flowledge/go/gateway-service/internal/provider"
	store "github.com/wybin4/flowledge/go/pkg/db"
	"github.com/wybin4/flowledge/go/pkg/transport"
	"go.uber.org/fx"
)

func main() {
	app := fx.New(
		// --- Providers ---
		fx.Provide(
			// Logger
			func() watermill.LoggerAdapter {
				return watermill.NewStdLogger(true, true)
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

			// Kafka Subscriber
			func(logger watermill.LoggerAdapter) (*kafka.Subscriber, error) {
				return kafka.NewSubscriber(
					kafka.SubscriberConfig{
						Brokers:       []string{"localhost:29092"},
						ConsumerGroup: "gateway-group",
						Unmarshaler:   kafka.DefaultMarshaler{},
					},
					logger,
				)
			},

			// Memory store для пермишнов
			func() *store.MemoryStore[gateway_provider.GetPermissionResponse] {
				return store.NewMemoryStore[gateway_provider.GetPermissionResponse]()
			},

			// PermissionsProvider без запуска loadPermissions
			func(pub *kafka.Publisher, sub *kafka.Subscriber, store *store.MemoryStore[gateway_provider.GetPermissionResponse]) *gateway_provider.PermissionsProvider {
				manager := transport.NewResourceManager(store)
				client := transport.NewServiceClient[gateway_provider.GetPermissionResponse](pub, sub, "policy.requests", "policy.responses")
				return gateway_provider.NewPermissionsProvider(client, manager)
			},

			// HTTP Gateway handler
			func(pub *kafka.Publisher) *gateway.GatewayHandler {
				return gateway.NewGatewayHandler(pub)
			},

			// Router
			func() *mux.Router {
				return mux.NewRouter()
			},
		),

		// --- Register HTTP routes ---
		fx.Invoke(func(handler *gateway.GatewayHandler, router *mux.Router) {
			handler.RegisterRoutes(router)
		}),

		// --- Subscribe to Kafka topics ---
		fx.Invoke(func(lc fx.Lifecycle, sub *kafka.Subscriber, h *gateway.GatewayHandler, logger watermill.LoggerAdapter) {
			lc.Append(fx.Hook{
				OnStart: func(ctx context.Context) error {
					go func() {
						topics := []string{"account.responses", "policy.responses"}
						for _, topic := range topics {
							messages, err := sub.Subscribe(ctx, topic)
							if err != nil {
								logger.Error("Failed to subscribe to topic "+topic, err, nil)
								continue
							}

							go func(msgs <-chan *message.Message) {
								for msg := range msgs {
									var resp struct {
										CorrelationID string      `json:"correlation_id"`
										Payload       interface{} `json:"payload"`
										Error         string      `json:"error"`
									}
									if err := json.Unmarshal(msg.Payload, &resp); err != nil {
										logger.Error("Failed to unmarshal response", err, nil)
										continue
									}

									h.Mutex.RLock()
									ch, ok := h.ResponseChannels[resp.CorrelationID]
									h.Mutex.RUnlock()
									if ok {
										ch <- msg
									}
								}
							}(messages)
						}
					}()
					return nil
				},
			})
		}),

		// --- Start HTTP server ---
		fx.Invoke(func(lc fx.Lifecycle, router *mux.Router) {
			lc.Append(fx.Hook{
				OnStart: func(ctx context.Context) error {
					go func() {
						log.Println("Gateway running on :8084")
						if err := http.ListenAndServe(":8084", router); err != nil {
							log.Fatal(err)
						}
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
