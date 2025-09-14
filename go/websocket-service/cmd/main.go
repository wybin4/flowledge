package main

import (
	"context"
	"log"
	"net/http"

	"go.uber.org/fx"

	kafkaPkg "github.com/wybin4/flowledge/go/pkg/kafka"
	ws "github.com/wybin4/flowledge/go/websocket-service/internal"
)

func main() {
	app := fx.New(
		fx.Provide(
			func() *ws.Hub { return ws.NewHub() },

			// Consumer для user-changed
			fx.Annotate(
				func() *kafkaPkg.Consumer {
					return kafkaPkg.NewConsumer("localhost:9092", "user-changed", "ws-service-group")
				},
				fx.ResultTags(`name:"userConsumer"`),
			),

			// Consumer для setting-changed
			fx.Annotate(
				func() *kafkaPkg.Consumer {
					return kafkaPkg.NewConsumer("localhost:9092", "setting-changed", "ws-service-group")
				},
				fx.ResultTags(`name:"settingConsumer"`),
			),
		),

		fx.Invoke(fx.Annotate(
			func(
				lc fx.Lifecycle,
				hub *ws.Hub,
				userConsumer *kafkaPkg.Consumer,
				settingConsumer *kafkaPkg.Consumer,
			) {
				lc.Append(fx.Hook{
					OnStart: func(ctx context.Context) error {
						log.Println("Starting WebSocket service components...")

						// WebSocket endpoint
						http.HandleFunc("/ws", ws.ServeWS(hub))

						// HTTP сервер
						go func() {
							log.Println("WebSocket server running on :8082")
							if err := http.ListenAndServe(":8082", nil); err != nil {
								log.Fatal("HTTP server error:", err)
							}
						}()

						// Consumer для user-changed
						go func() {
							log.Println("Starting Kafka consumer: user-changed")
							err := userConsumer.Consume(context.Background(), func(key string, payload map[string]interface{}) {
								log.Printf("Received user event: key=%s, payload=%v", key, payload)
								hub.Broadcast(payload)
							})
							if err != nil {
								log.Printf("Kafka consumer stopped with error (user-changed): %v", err)
							}
						}()

						// Consumer для setting-changed
						go func() {
							log.Println("Starting Kafka consumer: setting-changed")
							err := settingConsumer.Consume(context.Background(), func(key string, payload map[string]interface{}) {
								log.Printf("Received setting event: key=%s, payload=%v", key, payload)
								hub.Broadcast(payload)
							})
							if err != nil {
								log.Printf("Kafka consumer stopped with error (setting-changed): %v", err)
							}
						}()

						return nil
					},
					OnStop: func(ctx context.Context) error {
						log.Println("Stopping WebSocket service...")
						userConsumer.Close()
						settingConsumer.Close()
						return nil
					},
				})
			},
			fx.ParamTags(
				"",
				"",
				`name:"userConsumer"`,
				`name:"settingConsumer"`,
			),
		)),
	)

	app.Run()
}
