package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill-kafka/v2/pkg/kafka"
	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/ThreeDotsLabs/watermill/message/router/middleware"
	"github.com/gorilla/mux"
)

// CustomMarshaler для JSON сообщений
type JSONMarshaler struct{}

func (JSONMarshaler) Marshal(topic string, msg *message.Message) ([]byte, error) {
	return msg.Payload, nil
}

func (JSONMarshaler) Unmarshal(topic string, payload []byte) (*message.Message, error) {
	return message.NewMessage(watermill.NewUUID(), payload), nil
}

func main() {
	logger := watermill.NewStdLogger(true, true)

	// Kafka publisher для отправки запросов
	publisher, err := kafka.NewPublisher(
		kafka.PublisherConfig{
			Brokers:   []string{"localhost:9092"},
			Marshaler: kafka.DefaultMarshaler{}, // ✅ Используем кастомный маршаллер
		},
		logger,
	)
	if err != nil {
		panic(err)
	}

	// Kafka subscriber для получения ответов
	subscriber, err := kafka.NewSubscriber(
		kafka.SubscriberConfig{
			Brokers:       []string{"localhost:9092"},
			ConsumerGroup: "gateway-group",
			Unmarshaler:   kafka.DefaultMarshaler{}, // ✅ И здесь тоже
		},
		logger,
	)
	if err != nil {
		panic(err)
	}

	// Создаем router для обработки ответов
	router, err := message.NewRouter(message.RouterConfig{}, logger)
	if err != nil {
		panic(err)
	}

	// Middleware
	router.AddMiddleware(middleware.Retry{MaxRetries: 3}.Middleware)
	router.AddMiddleware(middleware.Recoverer)

	// Мапа для хранения ожидающих ответов
	responseChannels := make(map[string]chan *message.Message)
	mutex := &sync.RWMutex{}

	// Обработчик ответов от сервисов
	router.AddHandler(
		"gateway_response_handler",
		"gateway.responses",
		subscriber,
		"", // не публикуем дальше
		nil,
		func(msg *message.Message) ([]*message.Message, error) {
			var response struct {
				CorrelationID string      `json:"correlation_id"`
				Payload       interface{} `json:"payload"`
				Error         string      `json:"error"`
			}

			if err := json.Unmarshal(msg.Payload, &response); err != nil {
				log.Printf("Failed to unmarshal response: %v", err)
				return nil, nil
			}

			mutex.RLock()
			ch, exists := responseChannels[response.CorrelationID]
			mutex.RUnlock()

			if exists {
				ch <- msg
				mutex.Lock()
				delete(responseChannels, response.CorrelationID)
				mutex.Unlock()
			}

			return nil, nil
		},
	)

	// Запускаем router в горутине
	go func() {
		log.Println("Gateway router starting...")
		if err := router.Run(context.Background()); err != nil {
			panic(err)
		}
	}()

	// HTTP handler
	handler := &GatewayHandler{
		publisher:        publisher,
		responseChannels: responseChannels,
		mutex:            mutex,
		responseTimeout:  10 * time.Second,
	}

	r := mux.NewRouter()

	// Регистрируем endpoints
	r.HandleFunc("/users.get/{id}", handler.handleGetUser).Methods("GET")
	r.HandleFunc("/users.create", handler.handleCreateUser).Methods("POST")
	r.HandleFunc("/settings.set", handler.handleSetSettings).Methods("POST")

	log.Println("Gateway running on :8084")
	if err := http.ListenAndServe(":8084", r); err != nil {
		log.Fatal(err)
	}
}

type GatewayHandler struct {
	publisher        *kafka.Publisher
	responseChannels map[string]chan *message.Message
	mutex            *sync.RWMutex
	responseTimeout  time.Duration
}

func (h *GatewayHandler) handleGetUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	payload := map[string]interface{}{
		"id": id,
	}

	h.forwardRequest(w, r, "user-service", "users.get", payload)
}

func (h *GatewayHandler) handleCreateUser(w http.ResponseWriter, r *http.Request) {
	var input map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	h.forwardRequest(w, r, "user-service", "users.create", input)
}

func (h *GatewayHandler) handleSetSettings(w http.ResponseWriter, r *http.Request) {
	var input map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	h.forwardRequest(w, r, "setting-service", "settings.set", input)
}

func (h *GatewayHandler) forwardRequest(w http.ResponseWriter, r *http.Request, service, endpoint string, payload interface{}) {
	correlationID := watermill.NewUUID()
	responseChan := make(chan *message.Message, 1)

	h.mutex.Lock()
	h.responseChannels[correlationID] = responseChan
	h.mutex.Unlock()

	defer func() {
		h.mutex.Lock()
		delete(h.responseChannels, correlationID)
		h.mutex.Unlock()
	}()

	// Формируем запрос
	request := map[string]interface{}{
		"correlation_id": correlationID,
		"service":        service,
		"endpoint":       endpoint,
		"payload":        payload,
	}

	requestBytes, err := json.Marshal(request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Выбираем топик по сервису
	var topic string
	switch service {
	case "user-service":
		topic = "user.requests"
	case "setting-service":
		topic = "setting.requests"
	default:
		http.Error(w, fmt.Sprintf("unknown service: %s", service), http.StatusBadRequest)
		return
	}

	// Отправляем в Kafka
	msg := message.NewMessage(correlationID, requestBytes)
	if err := h.publisher.Publish(topic, msg); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Ждем ответа
	select {
	case responseMsg := <-responseChan:
		var response struct {
			Payload interface{} `json:"payload"`
			Error   string      `json:"error"`
		}

		if err := json.Unmarshal(responseMsg.Payload, &response); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if response.Error != "" {
			http.Error(w, response.Error, http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response.Payload)

	case <-time.After(h.responseTimeout):
		http.Error(w, "Request timeout", http.StatusGatewayTimeout)
	}
}
