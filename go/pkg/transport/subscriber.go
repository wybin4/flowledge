package transport

import (
	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill-kafka/v2/pkg/kafka"
	"github.com/ThreeDotsLabs/watermill/message"
)

func NewKafkaSubscriber(brokers []string, group string, logger watermill.LoggerAdapter) (message.Subscriber, error) {
	return kafka.NewSubscriber(
		kafka.SubscriberConfig{
			Brokers:       brokers,
			ConsumerGroup: group,
			Unmarshaler:   kafka.DefaultMarshaler{},
		},
		logger,
	)
}
