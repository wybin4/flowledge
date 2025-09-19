package transport

import (
	"os"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill-kafka/v2/pkg/kafka"
)

func GetKafkaBroker() string {
	broker := os.Getenv("KAFKA_BROKER")
	if broker == "" {
		broker = "localhost:29092"
	}
	return broker
}

func NewKafkaPublisher(logger watermill.LoggerAdapter) (*kafka.Publisher, error) {
	broker := GetKafkaBroker()
	return kafka.NewPublisher(kafka.PublisherConfig{
		Brokers:   []string{broker},
		Marshaler: kafka.DefaultMarshaler{},
	}, logger)
}

func NewKafkaSubscriber(group string, logger watermill.LoggerAdapter) (*kafka.Subscriber, error) {
	broker := GetKafkaBroker()
	return kafka.NewSubscriber(kafka.SubscriberConfig{
		Brokers:       []string{broker},
		ConsumerGroup: group,
		Unmarshaler:   kafka.DefaultMarshaler{},
	}, logger)
}
