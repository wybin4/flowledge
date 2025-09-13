package kafka

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/segmentio/kafka-go"
)

// Producer обертка над kafka.Writer
type Producer struct {
	writer     *kafka.Writer
	topic      string
	brokerAddr string
}

// NewProducer создает новый продьюсер
// brokerAddr — адрес брокера, topic — название топика
func NewProducer(brokerAddr, topic string, partitions int) (*Producer, error) {
	// создаем топик при инициализации
	conn, err := kafka.Dial("tcp", brokerAddr)
	if err != nil {
		return nil, fmt.Errorf("failed to dial kafka: %w", err)
	}
	defer conn.Close()

	controller, err := conn.Controller()
	if err != nil {
		return nil, fmt.Errorf("failed to get controller: %w", err)
	}

	cc, err := kafka.Dial("tcp", fmt.Sprintf("%s:%d", controller.Host, controller.Port))
	if err != nil {
		return nil, fmt.Errorf("failed to dial controller: %w", err)
	}
	defer cc.Close()

	topicConfig := kafka.TopicConfig{
		Topic:             topic,
		NumPartitions:     partitions,
		ReplicationFactor: 1,
	}

	if err := cc.CreateTopics(topicConfig); err != nil {
		// если топик уже есть, можно игнорировать ошибку
		if !isTopicAlreadyExists(err) {
			return nil, fmt.Errorf("failed to create topic: %w", err)
		}
	}

	w := kafka.NewWriter(kafka.WriterConfig{
		Brokers:  []string{brokerAddr},
		Topic:    topic,
		Balancer: &kafka.LeastBytes{},
		Async:    false,
	})

	return &Producer{
		writer:     w,
		topic:      topic,
		brokerAddr: brokerAddr,
	}, nil
}

func isTopicAlreadyExists(err error) bool {
	// segmentio/kafka-go возвращает специфичное сообщение об ошибке, можно проверять текст
	return err != nil && (err.Error() == "topic already exists" || err.Error() == "Topic with this name already exists")
}

// Send отправляет любое сообщение в топик
func (p *Producer) Send(ctx context.Context, key string, payload interface{}) error {
	log.Printf("Sending message to Kafka: topic=%s, key=%s", p.topic, key)
	
	data, err := json.Marshal(payload)
	if err != nil {
		log.Printf("Kafka marshal error: %v", err)
		return fmt.Errorf("kafka marshal error: %w", err)
	}

	msg := kafka.Message{
		Key:   []byte(key),
		Value: data,
		Time:  time.Now(),
	}

	if err := p.writer.WriteMessages(ctx, msg); err != nil {
		log.Printf("Kafka write error: %v", err)
		return fmt.Errorf("kafka write message error: %w", err)
	}

	log.Printf("Message sent successfully to topic %s", p.topic)
	return nil
}