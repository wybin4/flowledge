package transport

import (
	"fmt"
	"log"
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

func NewPersistentKafkaSubscriber(prefix string, logger watermill.LoggerAdapter) (*kafka.Subscriber, error) {
	broker := GetKafkaBroker()
	consumerGroup := fmt.Sprintf("%s-group", prefix)

	config := kafka.SubscriberConfig{
		Brokers:       []string{broker},
		ConsumerGroup: consumerGroup,
		Unmarshaler:   kafka.DefaultMarshaler{},
	}

	sub, err := kafka.NewSubscriber(config, logger)
	if err != nil {
		return nil, fmt.Errorf("failed to create Kafka subscriber: %w", err)
	}

	log.Printf("✅ Created Kafka subscriber for group: %s", consumerGroup)
	return sub, nil
}
