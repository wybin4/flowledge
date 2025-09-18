package websocket

import (
	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill/message"
	"go.uber.org/fx"

	"github.com/wybin4/flowledge/go/pkg/transport"
)

type Subscribers struct {
	fx.In

	UserSubscriber    message.Subscriber `name:"userSubscriber"`
	SettingSubscriber message.Subscriber `name:"settingSubscriber"`
}

func ProvideSubscribers(brokers []string) fx.Option {
	return fx.Options(
		// UserSubscriber
		fx.Provide(
			fx.Annotate(
				func(logger watermill.LoggerAdapter) (message.Subscriber, error) {
					return transport.NewKafkaSubscriber(brokers, "websocket-user-group", logger)
				},
				fx.ResultTags(`name:"userSubscriber"`),
			),
		),
		// SettingSubscriber
		fx.Provide(
			fx.Annotate(
				func(logger watermill.LoggerAdapter) (message.Subscriber, error) {
					return transport.NewKafkaSubscriber(brokers, "websocket-setting-group", logger)
				},
				fx.ResultTags(`name:"settingSubscriber"`),
			),
		),
	)
}
