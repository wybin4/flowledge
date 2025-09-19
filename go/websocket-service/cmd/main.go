package main

import (
	"context"
	"log"
	"net/http"

	"github.com/ThreeDotsLabs/watermill"
	"go.uber.org/fx"

	ws "github.com/wybin4/flowledge/go/websocket-service/internal"
)

func main() {
	app := fx.New(
		fx.Provide(
			func() *ws.Hub { return ws.NewHub() },
			func() watermill.LoggerAdapter { return watermill.NewStdLogger(true, true) },
		),

		// Подключаем сразу пачку сабскрайберов
		ws.ProvideSubscribers(),

		// WatermillSubscriber
		fx.Provide(func(hub *ws.Hub, subs ws.Subscribers, logger watermill.LoggerAdapter) *ws.WatermillSubscriber {
			return ws.NewWatermillSubscriber(hub, subs.UserSubscriber, subs.SettingSubscriber, logger)
		}),

		fx.Invoke(func(lc fx.Lifecycle, hub *ws.Hub, subscriber *ws.WatermillSubscriber) {
			lc.Append(fx.Hook{
				OnStart: func(ctx context.Context) error {
					http.HandleFunc("/ws", ws.ServeWS(hub))
					go func() {
						log.Println("WebSocket server running on :8082")
						if err := http.ListenAndServe(":8082", nil); err != nil {
							log.Fatal(err)
						}
					}()
					go func() {
						if err := subscriber.Start(ctx); err != nil {
							log.Fatalf("Transport subscriber failed: %v", err)
						}
					}()
					return nil
				},
				OnStop: func(ctx context.Context) error {
					return subscriber.Close()
				},
			})
		}),
	)

	app.Run()
}
