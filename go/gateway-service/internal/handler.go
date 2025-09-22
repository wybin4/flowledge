package gateway

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gorilla/mux"
	gateway_limit "github.com/wybin4/flowledge/go/gateway-service/internal/limit"
	gateway_metric "github.com/wybin4/flowledge/go/gateway-service/internal/metric"
	gateway_provider "github.com/wybin4/flowledge/go/gateway-service/internal/provider"
	"github.com/wybin4/flowledge/go/pkg/transport"
	pkg_type "github.com/wybin4/flowledge/go/pkg/type"
)

type GatewayHandler struct {
	AccountClient      *transport.Client
	PolicyClient       *transport.Client
	RateLimiter        *gateway_limit.RateLimiter
	LoginLimiter       *gateway_limit.LoginLimiter
	PermissionProvider *gateway_provider.PermissionsProvider
}

func NewGatewayHandler(accountClient, policyClient *transport.Client, permProvider *gateway_provider.PermissionsProvider) *GatewayHandler {
	return &GatewayHandler{
		AccountClient:      accountClient,
		PolicyClient:       policyClient,
		RateLimiter:        gateway_limit.NewRateLimiter(5, 10, 5*time.Minute),
		LoginLimiter:       gateway_limit.NewLoginLimiter(2, 5*time.Minute, 30*time.Minute),
		PermissionProvider: permProvider,
	}
}

func (h *GatewayHandler) RateLimitMiddleware(next http.Handler) http.Handler {
	return h.RateLimiter.Middleware(next)
}

type ctxKey string

const userClaimsKey ctxKey = "userClaims"

func (h *GatewayHandler) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/login" || r.URL.Path == "/refresh" {
			next.ServeHTTP(w, r)
			return
		}

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "missing Authorization header", http.StatusUnauthorized)
			return
		}

		var token string
		fmt.Sscanf(authHeader, "Bearer %s", &token)
		if token == "" {
			http.Error(w, "invalid Authorization header", http.StatusUnauthorized)
			return
		}

		input := map[string]interface{}{"token": token}
		respBytes, err := h.AccountClient.Request(r.Context(), "account-service", "validate", input)
		if err != nil {
			http.Error(w, "token validation failed", http.StatusUnauthorized)
			return
		}

		if len(respBytes) == 0 || string(respBytes) == "null" {
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}

		var claims pkg_type.UserClaimsResponse
		if err := json.Unmarshal(respBytes, &claims); err != nil {
			http.Error(w, "invalid token response", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), userClaimsKey, &claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (r *statusRecorder) WriteHeader(code int) {
	r.status = code
	r.ResponseWriter.WriteHeader(code)
}

func (h *GatewayHandler) MetricsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/metrics") {
			next.ServeHTTP(w, r)
			return
		}

		route := mux.CurrentRoute(r)
		routePath, err := route.GetPathTemplate()
		if err != nil {
			routePath = r.URL.Path
		}

		start := time.Now()
		gateway_metric.HttpConcurrentRequests.WithLabelValues(routePath, r.Method).Inc()
		defer gateway_metric.HttpConcurrentRequests.WithLabelValues(routePath, r.Method).Dec()

		rw := &statusRecorder{ResponseWriter: w, status: 200}
		next.ServeHTTP(rw, r)

		duration := time.Since(start).Seconds()
		gateway_metric.HttpRequestDuration.WithLabelValues(routePath, r.Method).Observe(duration)
		gateway_metric.HttpRequestsTotal.WithLabelValues(routePath, r.Method, http.StatusText(rw.status)).Inc()

		if rw.status >= 400 {
			gateway_metric.HttpRequestsFailed.WithLabelValues(routePath, r.Method).Inc()
		}
	})
}

func RequirePermission(h *GatewayHandler, permID string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims, ok := r.Context().Value(userClaimsKey).(*pkg_type.UserClaimsResponse)
		if !ok || claims == nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		if !h.PermissionProvider.CheckPermission(permID, claims.Roles) {
			http.Error(w, "forbidden", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (h *GatewayHandler) RegisterRoutes(r *mux.Router) {
	sr := r.PathPrefix("/").Subrouter()

	sr.Use(h.RateLimitMiddleware)
	sr.Use(h.AuthMiddleware)
	r.Use(h.MetricsMiddleware)
	sr.Use(h.MetricsMiddleware)

	sr.HandleFunc("/users.get/{id}", h.handleGetUser).Methods("GET")
	sr.Handle("/users.create", RequirePermission(h, "manage-users", http.HandlerFunc(h.handleCreateUser))).Methods("POST")

	sr.HandleFunc("/settings.get", h.handleGetSettings).Methods("GET")
	sr.Handle("/settings.set", RequirePermission(h, "edit-private-settings", http.HandlerFunc(h.handleSetSettings))).Methods("POST")

	sr.HandleFunc("/permissions.get", h.handleGetPermissions).Methods("GET")
	sr.Handle("/permissions.toggle-role", RequirePermission(h, "manage-permissions", http.HandlerFunc(h.handleToggleRole))).Methods("POST")

	sr.HandleFunc("/roles.get", h.handleGetRoles).Methods("GET")
	sr.Handle("/roles.create", RequirePermission(h, "manage-roles", http.HandlerFunc(h.handleCreateRole))).Methods("POST")
	sr.Handle("/roles.update", RequirePermission(h, "manage-roles", http.HandlerFunc(h.handleUpdateRole))).Methods("PATCH")
	sr.Handle("/roles.delete", RequirePermission(h, "manage-roles", http.HandlerFunc(h.handleDeleteRole))).Methods("DELETE")

	r.HandleFunc("/login", h.handleLogin).Methods("POST")
	r.HandleFunc("/refresh", h.handleRefresh).Methods("POST")
}

// --- HTTP handlers ---
func (h *GatewayHandler) handleGetUser(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	h.forwardRequest(w, r, h.AccountClient, "account-service", "users.get", map[string]interface{}{"id": id})
}

func (h *GatewayHandler) handleCreateUser(w http.ResponseWriter, r *http.Request) {
	var input map[string]interface{}
	json.NewDecoder(r.Body).Decode(&input)
	h.forwardRequest(w, r, h.AccountClient, "account-service", "users.create", input)
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
	resp, err := h.AccountClient.Request(r.Context(), "account-service", "login", input)
	w.Header().Set("Content-Type", "application/json")

	if err != nil {
		// Любая системная ошибка
		h.LoginLimiter.IncrementFailed(input.Username, r.RemoteAddr)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	if len(resp) == 0 || string(resp) == "null" {
		w.Write([]byte("{}"))
		return
	}

	// Успешный вход — сбросить счётчики
	h.LoginLimiter.Reset(input.Username, r.RemoteAddr)

	w.Write(resp)
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
	resp, err := client.Request(r.Context(), service, endpoint, payload)
	w.Header().Set("Content-Type", "application/json")

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	if len(resp) == 0 || string(resp) == "null" {
		w.Write([]byte("{}"))
		return
	}

	w.Write(resp)
}
