package websocket

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/ThreeDotsLabs/watermill/message"
)

type Listener struct {
	UserSubscriber    message.Subscriber
	SettingSubscriber message.Subscriber
	Hub               *Hub
	cancelFunc        context.CancelFunc
}

func (l *Listener) Start() {
	ctx, cancel := context.WithCancel(context.Background())
	l.cancelFunc = cancel

	log.Println("Starting Kafka listeners with persistent context...")

	go l.consumeTopic(ctx, l.UserSubscriber, "user-events", "/topic/user-changed")
	go l.consumeTopic(ctx, l.SettingSubscriber, "setting-events", "/topic/private-settings-changed")
}

func (l *Listener) consumeTopic(ctx context.Context, sub message.Subscriber, topic, wsTopic string) {
	log.Printf("[%s] Starting listener...", topic)

	for {
		select {
		case <-ctx.Done():
			log.Printf("[%s] Context cancelled, stopping listener", topic)
			return
		default:
		}

		messages, err := sub.Subscribe(ctx, topic)
		if err != nil {
			log.Printf("[%s] Subscribe error: %v, retrying in 5s", topic, err)
			select {
			case <-ctx.Done():
				return
			case <-time.After(5 * time.Second):
				continue
			}
		}

		log.Printf("[%s] Successfully subscribed", topic)

		for {
			select {
			case <-ctx.Done():
				log.Printf("[%s] Context cancelled, exiting", topic)
				return
			case msg, ok := <-messages:
				if !ok {
					log.Printf("[%s] Message channel closed, reconnecting...", topic)
					break
				}

				log.Printf("[%s] Received message: %s", topic, string(msg.Payload))
				var rawMessage interface{}
				json.Unmarshal(msg.Payload, &rawMessage)
				l.Hub.Broadcast(wsTopic, rawMessage)
				msg.Ack()
			}
		}
	}
}

func (l *Listener) Close() error {
	log.Println("Closing Kafka listeners...")

	if l.cancelFunc != nil {
		l.cancelFunc()
	}

	var err error

	if l.UserSubscriber != nil {
		if closeErr := l.UserSubscriber.Close(); closeErr != nil {
			log.Printf("Error closing user subscriber: %v", closeErr)
			err = closeErr
		}
	}

	if l.SettingSubscriber != nil {
		if closeErr := l.SettingSubscriber.Close(); closeErr != nil {
			log.Printf("Error closing setting subscriber: %v", closeErr)
			if err == nil {
				err = closeErr
			}
		}
	}

	log.Println("Kafka listeners closed")
	return err
}
