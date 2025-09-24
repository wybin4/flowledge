package main

import (
	"context"
	"log"
	"net/http"

	"go.uber.org/fx"

	ws "github.com/wybin4/flowledge/go/websocket-service/internal"
)

func main() {
	app := fx.New(
		fx.Provide(
			func() *ws.Hub { return ws.NewHub() },
		),

		fx.Invoke(func(lc fx.Lifecycle, hub *ws.Hub) {
			lc.Append(fx.Hook{
				OnStart: func(ctx context.Context) error {
					go hub.Run()

					http.HandleFunc("/websocket", ws.ServeWS(hub))
					http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
						w.WriteHeader(http.StatusOK)
						w.Write([]byte("OK"))
					})

					go func() {
						log.Println("WebSocket server running on :8088")
						log.Println("WebSocket endpoint: ws://localhost:8088/websocket")
						if err := http.ListenAndServe(":8088", nil); err != nil {
							log.Fatal("Server error:", err)
						}
					}()

					return nil
				},
				OnStop: func(ctx context.Context) error {
					log.Println("Shutting down WebSocket server")
					return nil
				},
			})
		}),
	)

	app.Run()
}
