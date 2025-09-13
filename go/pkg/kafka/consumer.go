package kafka

import (
	"context"
	"encoding/json"
	"log"

	"github.com/segmentio/kafka-go"
)

// Consumer обёртка для Kafka консьюмера
type Consumer struct {
	reader *kafka.Reader
}

// NewConsumer создаёт консьюмера для заданного топика
func NewConsumer(brokerAddr, topic, groupID string) *Consumer {
	r := kafka.NewReader(kafka.ReaderConfig{
		Brokers:  []string{brokerAddr},
		Topic:    topic,
		GroupID:  groupID,
		MinBytes: 10e3, // 10KB
		MaxBytes: 10e6, // 10MB
	})
	return &Consumer{reader: r}
}

// Consume запускает блокирующее чтение сообщений и вызывает callback для каждого сообщения
func (c *Consumer) Consume(ctx context.Context, callback func(key string, payload map[string]interface{})) error {
	log.Printf("Starting Kafka consumer for topic: %s", c.reader.Config().Topic)

	for {
		m, err := c.reader.FetchMessage(ctx)
		if err != nil {
			if ctx.Err() != nil {
				log.Println("Kafka consumer stopped: context cancelled")
				return nil
			}
			log.Println("Kafka fetch error:", err)
			continue
		}

		log.Printf("Received Kafka message: topic=%s, key=%s, value=%s",
			m.Topic, string(m.Key), string(m.Value))

		var payload map[string]interface{}
		if err := json.Unmarshal(m.Value, &payload); err != nil {
			log.Println("Kafka unmarshal error:", err)
			continue
		}

		log.Printf("Calling callback with payload: %v", payload)
		callback(string(m.Key), payload)

		if err := c.reader.CommitMessages(ctx, m); err != nil {
			log.Println("Kafka commit error:", err)
		} else {
			log.Println("Kafka message committed successfully")
		}
	}
}

// Close закрывает консьюмер
func (c *Consumer) Close() error {
	return c.reader.Close()
}
