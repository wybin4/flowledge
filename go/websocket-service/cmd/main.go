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
			fx.Annotate(
				func() *kafkaPkg.Consumer {
					return kafkaPkg.NewConsumer("localhost:9092", "user-changed", "ws-service-group")
				},
				fx.ResultTags(`name:"userConsumer"`),
			),
		),

		fx.Invoke(fx.Annotate(
			func(
				lc fx.Lifecycle,
				hub *ws.Hub,
				userConsumer *kafkaPkg.Consumer,
			) {
				lc.Append(fx.Hook{
					OnStart: func(ctx context.Context) error {
						log.Println("Starting WebSocket service components...")

						// WebSocket endpoint
						http.HandleFunc("/ws", ws.ServeWS(hub))

						// Запускаем HTTP сервер в отдельной горутине
						go func() {
							log.Println("WebSocket server running on :8082")
							if err := http.ListenAndServe(":8082", nil); err != nil {
								log.Fatal("HTTP server error:", err)
							}
						}()

						// Запускаем Kafka Consumer в отдельной горутине с отдельным контекстом
						go func() {
							// Создаем отдельный контекст для Consumer'а
							consumerCtx := context.Background()
							log.Println("Starting Kafka consumer...")

							err := userConsumer.Consume(consumerCtx, func(key string, payload map[string]interface{}) {
								log.Printf("Received user event: key=%s, payload=%v", key, payload)
								hub.Broadcast(payload)
							})

							if err != nil {
								log.Printf("Kafka consumer stopped with error: %v", err)
							}
						}()

						return nil
					},
					OnStop: func(ctx context.Context) error {
						log.Println("Stopping WebSocket service...")
						userConsumer.Close()
						return nil
					},
				})
			},
			fx.ParamTags(
				"",
				"",
				`name:"userConsumer"`,
			),
		)),
	)

	app.Run()
}
