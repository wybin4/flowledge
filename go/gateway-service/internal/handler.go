package gateway

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	gateway_limit "github.com/wybin4/flowledge/go/gateway-service/internal/limit"
	"github.com/wybin4/flowledge/go/pkg/transport"
)

// GatewayHandler хранит клиентов для разных сервисов
type GatewayHandler struct {
	AccountClient *transport.Client
	PolicyClient  *transport.Client
	RateLimiter   *gateway_limit.RateLimiter
	LoginLimiter  *gateway_limit.LoginLimiter
}

// NewGatewayHandler конструктор
func NewGatewayHandler(accountClient, policyClient *transport.Client) *GatewayHandler {
	return &GatewayHandler{
		AccountClient: accountClient,
		PolicyClient:  policyClient,
		RateLimiter:   gateway_limit.NewRateLimiter(5, 10, 5*time.Minute),
		LoginLimiter:  gateway_limit.NewLoginLimiter(2, 5*time.Minute, 30*time.Minute),
	}
}

func (h *GatewayHandler) Middleware(next http.Handler) http.Handler {
	return h.RateLimiter.Middleware(next)
}

// Регистрация маршрутов
func (h *GatewayHandler) RegisterRoutes(r *mux.Router) {
	sr := r.PathPrefix("/").Subrouter()
	sr.Use(h.Middleware)

	// --- все маршруты через subrouter ---
	sr.HandleFunc("/users.get/{id}", h.handleGetUser).Methods("GET")

	sr.HandleFunc("/login", h.handleLogin).Methods("POST")
	sr.HandleFunc("/refresh", h.handleRefresh).Methods("POST")
	sr.HandleFunc("/register", h.handleRegister).Methods("POST")

	sr.HandleFunc("/settings.set", h.handleSetSettings).Methods("POST")
	sr.HandleFunc("/settings.get", h.handleGetSettings).Methods("GET")

	sr.HandleFunc("/permissions.get", h.handleGetPermissions).Methods("GET")
	sr.HandleFunc("/permissions.toggle-role", h.handleToggleRole).Methods("POST")

	sr.HandleFunc("/roles.get", h.handleGetRoles).Methods("GET")
	sr.HandleFunc("/roles.create", h.handleCreateRole).Methods("POST")
	sr.HandleFunc("/roles.update", h.handleUpdateRole).Methods("PATCH")
	sr.HandleFunc("/roles.delete", h.handleDeleteRole).Methods("DELETE")
}

// --- HTTP handlers ---
func (h *GatewayHandler) handleGetUser(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	h.forwardRequest(w, r, h.AccountClient, "account-service", "users.get", map[string]interface{}{"id": id})
}

func (h *GatewayHandler) handleRegister(w http.ResponseWriter, r *http.Request) {
	var input map[string]interface{}
	json.NewDecoder(r.Body).Decode(&input)
	h.forwardRequest(w, r, h.AccountClient, "account-service", "register", input)
}

func (h *GatewayHandler) handleLogin(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
		return
	}

	// Проверяем лимит по логину
	if blocked := h.LoginLimiter.IsBlocked(input.Username, r.RemoteAddr); blocked {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusTooManyRequests)
		json.NewEncoder(w).Encode(map[string]string{"error": "too many login attempts, wait"})
		return
	}

	// Форвардим запрос в account-service
	resp, err := h.AccountClient.Request(r.Context(), "account-service", "login", input, "gw")
	w.Header().Set("Content-Type", "application/json")

	if err != nil {
		// Любая системная ошибка
		h.LoginLimiter.IncrementFailed(input.Username, r.RemoteAddr)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	var wrapper struct {
		CorrelationID string          `json:"correlation_id"`
		Error         string          `json:"error,omitempty"`
		Payload       json.RawMessage `json:"payload"`
	}

	if err := json.Unmarshal(resp, &wrapper); err != nil {
		h.LoginLimiter.IncrementFailed(input.Username, r.RemoteAddr)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid response from service"})
		return
	}

	// Если сервис вернул ошибку авторизации
	if wrapper.Error != "" {
		h.LoginLimiter.IncrementFailed(input.Username, r.RemoteAddr)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": wrapper.Error})
		return
	}

	// Успешный вход — сбросить счётчики
	h.LoginLimiter.Reset(input.Username, r.RemoteAddr)

	// Отдаём payload
	if len(wrapper.Payload) > 0 && string(wrapper.Payload) != "null" {
		w.Write(wrapper.Payload)
		return
	}

	// Пустой payload
	w.Write([]byte("{}"))
}

func (h *GatewayHandler) handleRefresh(w http.ResponseWriter, r *http.Request) {
	var input map[string]interface{}
	json.NewDecoder(r.Body).Decode(&input)
	h.forwardRequest(w, r, h.AccountClient, "account-service", "refresh", input)
}

func (h *GatewayHandler) handleSetSettings(w http.ResponseWriter, r *http.Request) {
	var input map[string]interface{}
	json.NewDecoder(r.Body).Decode(&input)
	h.forwardRequest(w, r, h.PolicyClient, "policy-service", "settings.set", input)
}

func (h *GatewayHandler) handleGetSettings(w http.ResponseWriter, r *http.Request) {
	h.forwardRequest(w, r, h.PolicyClient, "policy-service", "settings.get", nil)
}

func (h *GatewayHandler) handleGetPermissions(w http.ResponseWriter, r *http.Request) {
	h.forwardRequest(w, r, h.PolicyClient, "policy-service", "permissions.get", nil)
}

func (h *GatewayHandler) handleToggleRole(w http.ResponseWriter, r *http.Request) {
	var input map[string]interface{}
	json.NewDecoder(r.Body).Decode(&input)
	h.forwardRequest(w, r, h.PolicyClient, "policy-service", "permissions.toggle-role", input)
}

func (h *GatewayHandler) handleGetRoles(w http.ResponseWriter, r *http.Request) {
	h.forwardRequest(w, r, h.PolicyClient, "policy-service", "roles.get", nil)
}
func (h *GatewayHandler) handleCreateRole(w http.ResponseWriter, r *http.Request) {
	var input map[string]interface{}
	json.NewDecoder(r.Body).Decode(&input)
	h.forwardRequest(w, r, h.PolicyClient, "policy-service", "roles.create", input)
}
func (h *GatewayHandler) handleUpdateRole(w http.ResponseWriter, r *http.Request) {
	var input map[string]interface{}
	json.NewDecoder(r.Body).Decode(&input)
	h.forwardRequest(w, r, h.PolicyClient, "policy-service", "roles.update", input)
}
func (h *GatewayHandler) handleDeleteRole(w http.ResponseWriter, r *http.Request) {
	var input map[string]interface{}
	json.NewDecoder(r.Body).Decode(&input)
	h.forwardRequest(w, r, h.PolicyClient, "policy-service", "roles.delete", input)
}

func (h *GatewayHandler) forwardRequest(w http.ResponseWriter, r *http.Request, client *transport.Client, service, endpoint string, payload interface{}) {
	resp, err := client.Request(r.Context(), service, endpoint, payload, "gw")
	w.Header().Set("Content-Type", "application/json")

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": err.Error(),
		})
		return
	}

	var wrapper struct {
		CorrelationID string          `json:"correlation_id"`
		Error         string          `json:"error,omitempty"`
		Payload       json.RawMessage `json:"payload"`
	}

	if err := json.Unmarshal(resp, &wrapper); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "invalid response from service",
		})
		return
	}

	if wrapper.Error != "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": wrapper.Error,
		})
		return
	}

	if len(wrapper.Payload) > 0 && string(wrapper.Payload) != "null" {
		w.Write(wrapper.Payload)
		return
	}

	w.Write([]byte("{}"))
}
