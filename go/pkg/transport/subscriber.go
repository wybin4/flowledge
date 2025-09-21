package transport

import (
	"fmt"
	"os"
	"time"

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

func GetPodID() string {
	podID := os.Getenv("POD_ID")
	if podID == "" {
		podID = fmt.Sprintf("local-%d", time.Now().UnixNano())
	}
	return podID
}

func NewKafkaPublisher(logger watermill.LoggerAdapter) (*kafka.Publisher, error) {
	broker := GetKafkaBroker()
	return kafka.NewPublisher(kafka.PublisherConfig{
		Brokers:   []string{broker},
		Marshaler: kafka.DefaultMarshaler{},
	}, logger)
}

func NewKafkaSubscriber(prefix string, logger watermill.LoggerAdapter) (*kafka.Subscriber, error) {
	broker := GetKafkaBroker()
	podID := GetPodID()

	return kafka.NewSubscriber(kafka.SubscriberConfig{
		Brokers:       []string{broker},
		ConsumerGroup: fmt.Sprintf("%s-%s", prefix, podID),
		Unmarshaler:   kafka.DefaultMarshaler{},
	}, logger)
}
