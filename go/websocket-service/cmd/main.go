package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/wybin4/flowledge/go/pkg/transport"
	ws "github.com/wybin4/flowledge/go/websocket-service/internal"
	"go.uber.org/fx"
)

func main() {
	app := fx.New(
		fx.Provide(func() watermill.LoggerAdapter {
			return watermill.NewStdLogger(true, true)
		}),

		fx.Provide(ws.NewHub),

		fx.Provide(func(logger watermill.LoggerAdapter, hub *ws.Hub) (*ws.Listener, error) {
			log.Println("Creating Kafka subscribers...")

			userSub, err := transport.NewPersistentKafkaSubscriber("websocket-user", logger)
			if err != nil {
				return nil, err
			}

			settingSub, err := transport.NewPersistentKafkaSubscriber("websocket-setting", logger)
			if err != nil {
				userSub.Close()
				return nil, err
			}

			return &ws.Listener{
				UserSubscriber:    userSub,
				SettingSubscriber: settingSub,
				Hub:               hub,
			}, nil
		}),

		fx.Invoke(func(lc fx.Lifecycle, hub *ws.Hub) {
			server := &http.Server{}

			lc.Append(fx.Hook{
				OnStart: func(ctx context.Context) error {
					go hub.Run()

					mux := http.NewServeMux()
					mux.HandleFunc("/websocket", ws.ServeWS(hub))
					mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
						w.WriteHeader(http.StatusOK)
						w.Write([]byte("OK"))
					})

					server.Handler = mux

					port := os.Getenv("PORT")
					if port == "" {
						port = "8088"
					}
					server.Addr = ":" + port

					go func() {
						log.Println("WebSocket server running on", server.Addr)
						if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
							log.Fatal("Server error:", err)
						}
					}()
					return nil
				},
				OnStop: func(ctx context.Context) error {
					log.Println("Shutting down WebSocket server...")
					hub.Shutdown()
					return server.Shutdown(ctx)
				},
			})
		}),

		fx.Invoke(func(lc fx.Lifecycle, listener *ws.Listener) {
			lc.Append(fx.Hook{
				OnStart: func(ctx context.Context) error {
					log.Println("Starting Kafka listeners...")
					go listener.Start()
					return nil
				},
				OnStop: func(ctx context.Context) error {
					log.Println("Stopping Kafka listeners...")
					return listener.Close()
				},
			})
		}),
	)

	if err := app.Err(); err != nil {
		log.Fatal("FX app error:", err)
	}

	log.Println("Starting application...")
	app.Run()
}
