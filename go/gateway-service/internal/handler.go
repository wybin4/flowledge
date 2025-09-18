package gateway

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill-kafka/v2/pkg/kafka"
	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/gorilla/mux"
)

// GatewayHandler хранит publisher и responseChannels
type GatewayHandler struct {
	Publisher        *kafka.Publisher
	ResponseChannels map[string]chan *message.Message
	Mutex            *sync.RWMutex
	ResponseTimeout  time.Duration
}

// NewGatewayHandler конструктор
func NewGatewayHandler(pub *kafka.Publisher) *GatewayHandler {
	return &GatewayHandler{
		Publisher:        pub,
		ResponseChannels: make(map[string]chan *message.Message),
		Mutex:            &sync.RWMutex{},
		ResponseTimeout:  10 * time.Second,
	}
}

// Регистрация маршрутов
func (h *GatewayHandler) RegisterRoutes(r *mux.Router) {
	r.HandleFunc("/users.get/{id}", h.handleGetUser).Methods("GET")
	r.HandleFunc("/login", h.handleLogin).Methods("POST")
	r.HandleFunc("/refresh", h.handleRefresh).Methods("POST")
	r.HandleFunc("/register", h.handleRegister).Methods("POST")

	r.HandleFunc("/settings.set", h.handleSetSettings).Methods("POST")
	r.HandleFunc("/settings.get", h.handleGetSettings).Methods("GET")

	r.HandleFunc("/permissions.get", h.handleGetPermissions).Methods("GET")
	r.HandleFunc("/permissions.toggle-role", h.handleToggleRole).Methods("POST")

	r.HandleFunc("/roles.get", h.handleGetRoles).Methods("GET")
	r.HandleFunc("/roles.create", h.handleCreateRole).Methods("POST")
	r.HandleFunc("/roles.update", h.handleUpdateRole).Methods("PATCH")
	r.HandleFunc("/roles.delete", h.handleDeleteRole).Methods("DELETE")
}

// --- HTTP handlers ---
func (h *GatewayHandler) handleGetUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	payload := map[string]interface{}{"id": id}
	h.forwardRequest(w, r, "account", "users.get", payload)
}

func (h *GatewayHandler) handleRegister(w http.ResponseWriter, r *http.Request) {
	var input map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	h.forwardRequest(w, r, "account", "register", input)
}

func (h *GatewayHandler) handleSetSettings(w http.ResponseWriter, r *http.Request) {
	var input map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	h.forwardRequest(w, r, "policy", "settings.set", input)
}

func (h *GatewayHandler) handleGetSettings(w http.ResponseWriter, r *http.Request) {
	h.forwardRequest(w, r, "policy", "settings.get", nil)
}

func (h *GatewayHandler) handleGetPermissions(w http.ResponseWriter, r *http.Request) {
	h.forwardRequest(w, r, "policy", "permissions.get", nil)
}

func (h *GatewayHandler) handleToggleRole(w http.ResponseWriter, r *http.Request) {
	var input map[string]interface{}
	if r.Method != http.MethodGet {
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}
	h.forwardRequest(w, r, "policy", r.URL.Path[1:], input)
}

func (h *GatewayHandler) handleGetRoles(w http.ResponseWriter, r *http.Request) {
	h.forwardRequest(w, r, "policy", "roles.get", nil)
}
func (h *GatewayHandler) handleCreateRole(w http.ResponseWriter, r *http.Request) {
	h.handleToggleRole(w, r)
}
func (h *GatewayHandler) handleUpdateRole(w http.ResponseWriter, r *http.Request) {
	h.handleToggleRole(w, r)
}
func (h *GatewayHandler) handleDeleteRole(w http.ResponseWriter, r *http.Request) {
	h.handleToggleRole(w, r)
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
	h.forwardRequest(w, r, "account", "login", payload)
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
	h.forwardRequest(w, r, "account", "refresh", payload)
}

// --- Forward request ---
func (h *GatewayHandler) forwardRequest(w http.ResponseWriter, r *http.Request, service, endpoint string, payload interface{}) {
	correlationID := watermill.NewUUID()
	responseChan := make(chan *message.Message, 1)

	h.Mutex.Lock()
	h.ResponseChannels[correlationID] = responseChan
	h.Mutex.Unlock()
	defer func() {
		h.Mutex.Lock()
		delete(h.ResponseChannels, correlationID)
		h.Mutex.Unlock()
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

	topic := fmt.Sprintf("%s.requests", service)
	msg := message.NewMessage(correlationID, requestBytes)
	if err := h.Publisher.Publish(topic, msg); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

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
	case <-time.After(h.ResponseTimeout):
		http.Error(w, "Request timeout", http.StatusGatewayTimeout)
	}
}
