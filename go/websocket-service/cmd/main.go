package main

import (
	"context"
	"log"
	"net/http"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill-kafka/v2/pkg/kafka"
	"github.com/ThreeDotsLabs/watermill/message"
	"go.uber.org/fx"

	ws "github.com/wybin4/flowledge/go/websocket-service/internal"
)

type Subscribers struct {
	fx.In

	UserSubscriber    message.Subscriber `name:"userSubscriber"`
	SettingSubscriber message.Subscriber `name:"settingSubscriber"`
}

func main() {
	app := fx.New(
		fx.Provide(
			func() *ws.Hub { return ws.NewHub() },
			func() watermill.LoggerAdapter { return watermill.NewStdLogger(true, true) },

			// Kafka Subscriber для user-events
			fx.Annotate(
				func(logger watermill.LoggerAdapter) (message.Subscriber, error) {
					return kafka.NewSubscriber(
						kafka.SubscriberConfig{
							Brokers:       []string{"localhost:9092"},
							ConsumerGroup: "websocket-user-group",
							Unmarshaler:   kafka.DefaultMarshaler{},
						},
						logger,
					)
				},
				fx.ResultTags(`name:"userSubscriber"`),
			),

			// Kafka Subscriber для setting-events
			fx.Annotate(
				func(logger watermill.LoggerAdapter) (message.Subscriber, error) {
					return kafka.NewSubscriber(
						kafka.SubscriberConfig{
							Brokers:       []string{"localhost:9092"},
							ConsumerGroup: "websocket-setting-group",
							Unmarshaler:   kafka.DefaultMarshaler{},
						},
						logger,
					)
				},
				fx.ResultTags(`name:"settingSubscriber"`),
			),

			// WatermillSubscriber
			func(hub *ws.Hub, subs Subscribers, logger watermill.LoggerAdapter) *ws.WatermillSubscriber {
				return ws.NewWatermillSubscriber(hub, subs.UserSubscriber, subs.SettingSubscriber, logger)
			},
		),

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
							log.Fatalf("Watermill subscriber failed: %v", err)
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
