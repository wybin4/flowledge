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

func main() {
	logger := watermill.NewStdLogger(true, true)

	// Kafka publisher для отправки запросов
	publisher, err := kafka.NewPublisher(
		kafka.PublisherConfig{
			Brokers:   []string{"localhost:29092"},
			Marshaler: kafka.DefaultMarshaler{},
		},
		logger,
	)
	if err != nil {
		panic(err)
	}

	// Kafka subscriber для получения ответов
	subscriber, err := kafka.NewSubscriber(
		kafka.SubscriberConfig{
			Brokers:       []string{"localhost:29092"},
			ConsumerGroup: "gateway-group",
			Unmarshaler:   kafka.DefaultMarshaler{},
		},
		logger,
	)
	if err != nil {
		panic(err)
	}

	// Router для обработки всех сервисных топиков
	router, err := message.NewRouter(message.RouterConfig{}, logger)
	if err != nil {
		panic(err)
	}

	router.AddMiddleware(middleware.Retry{MaxRetries: 3}.Middleware)
	router.AddMiddleware(middleware.Recoverer)

	// Мапа каналов для отслеживания ответов
	responseChannels := make(map[string]chan *message.Message)
	mutex := &sync.RWMutex{}

	// Список сервисных топиков, от которых ожидаем ответы
	serviceTopics := []string{
		"setting.responses",
		"user.responses",
		"auth.responses",
	}

	for _, topic := range serviceTopics {
		router.AddHandler(
			topic+"_handler",
			topic,
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
				}

				return nil, nil
			},
		)
	}

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
	r.HandleFunc("/register", handler.handleRegister).Methods("POST")
	r.HandleFunc("/settings.set", handler.handleSetSettings).Methods("POST")
	r.HandleFunc("/login", handler.handleLogin).Methods("POST")
	r.HandleFunc("/refresh", handler.handleRefresh).Methods("POST")

	log.Println("\033[31mGateway running on :8084\033[0m")
	if err := http.ListenAndServe(":8084", r); err != nil {
		log.Fatal(err)
	}
}

// GatewayHandler хранит publisher и responseChannels
type GatewayHandler struct {
	publisher        *kafka.Publisher
	responseChannels map[string]chan *message.Message
	mutex            *sync.RWMutex
	responseTimeout  time.Duration
}

// HTTP handlers
func (h *GatewayHandler) handleGetUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	payload := map[string]interface{}{"id": id}
	h.forwardRequest(w, r, "user", "users.get", payload)
}

func (h *GatewayHandler) handleRegister(w http.ResponseWriter, r *http.Request) {
	var input map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	h.forwardRequest(w, r, "auth", "register", input)
}

func (h *GatewayHandler) handleSetSettings(w http.ResponseWriter, r *http.Request) {
	var input map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	h.forwardRequest(w, r, "setting", "settings.set", input)
}

func (h *GatewayHandler) handleLogin(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	payload := map[string]interface{}{
		"username": req.Username,
		"password": req.Password,
	}
	h.forwardRequest(w, r, "auth", "login", payload)
}

func (h *GatewayHandler) handleRefresh(w http.ResponseWriter, r *http.Request) {
	var req struct {
		RefreshToken string `json:"refreshToken"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	payload := map[string]interface{}{"refreshToken": req.RefreshToken}
	h.forwardRequest(w, r, "auth", "refresh", payload)
}

// forwardRequest отправляет запрос в Kafka и ждет ответа на соответствующем топике
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

	request := map[string]interface{}{
		"correlation_id": correlationID,
		"service":        fmt.Sprintf("%s-service", service),
		"endpoint":       endpoint,
		"payload":        payload,
	}

	requestBytes, err := json.Marshal(request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Выбираем топик по сервису
	topic := fmt.Sprintf("%s.requests", service)

	msg := message.NewMessage(correlationID, requestBytes)
	if err := h.publisher.Publish(topic, msg); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Ждем ответа
	select {
	case responseMsg := <-responseChan:
		var resp struct {
			Payload interface{} `json:"payload"`
			Error   string      `json:"error"`
		}
		if err := json.Unmarshal(responseMsg.Payload, &resp); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if resp.Error != "" {
			http.Error(w, resp.Error, http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp.Payload)
	case <-time.After(h.responseTimeout):
		http.Error(w, "Request timeout", http.StatusGatewayTimeout)
	}
}
