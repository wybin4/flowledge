package gateway

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"
	gateway_limit "github.com/wybin4/flowledge/go/gateway-service/internal/limit"
	gateway_metric "github.com/wybin4/flowledge/go/gateway-service/internal/metric"
	gateway_provider "github.com/wybin4/flowledge/go/gateway-service/internal/provider"
	"github.com/wybin4/flowledge/go/pkg/transport"
	pkg_type "github.com/wybin4/flowledge/go/pkg/type"
	"github.com/wybin4/flowledge/go/pkg/utils"
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
		if r.URL.Path == "/api/auth/login" || r.URL.Path == "/api/auth/refresh" {
			next.ServeHTTP(w, r)
			return
		}

		jwtCookie, err := r.Cookie("jwtToken")
		if err != nil || jwtCookie.Value == "" {
			http.Error(w, "missing or empty JWT token cookie", http.StatusUnauthorized)
			return
		}

		claims, err := utils.ParseClaims(jwtCookie.Value, "supersecret")
		if err != nil {
			http.Error(w, "invalid JWT token", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), userClaimsKey, claims)
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
		if strings.HasPrefix(r.URL.Path, "/metrics") || r.Method == "OPTIONS" {
			next.ServeHTTP(w, r)
			return
		}

		route := mux.CurrentRoute(r)
		routePath, err := route.GetPathTemplate()
		if err != nil {
			routePath = r.URL.Path
		}

		start := time.Now()
		gateway_metric.HttpConcurrentRequests.WithLabelValues(routePath).Inc()
		defer gateway_metric.HttpConcurrentRequests.WithLabelValues(routePath).Dec()

		rw := &statusRecorder{ResponseWriter: w, status: 200}
		next.ServeHTTP(rw, r)

		duration := time.Since(start).Seconds()
		gateway_metric.HttpRequestDuration.WithLabelValues(routePath).Observe(duration)

		gateway_metric.HttpRequestsTotal.WithLabelValues(routePath).Inc()
		if rw.status >= 400 {
			gateway_metric.HttpRequestsFailed.WithLabelValues(routePath).Inc()
		}
	})
}

func RequirePermission(h *GatewayHandler, permID string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims, ok := r.Context().Value(userClaimsKey).(*pkg_type.UserClaims)
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

func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, DNT, User-Agent, X-Requested-With, If-Modified-Since, Cache-Control, Content-Type, Range")
		w.Header().Set("Access-Control-Expose-Headers", "Content-Length, Content-Range")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Max-Age", "86400")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (h *GatewayHandler) handleOptions(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
}

func (h *GatewayHandler) RegisterRoutes(r *mux.Router) {
	r.Use(CORSMiddleware)
	r.Use(h.MetricsMiddleware)
	r.Use(h.RateLimitMiddleware)

	r.HandleFunc("/api/{rest:.*}", h.handleOptions).Methods("OPTIONS")

	sr := r.PathPrefix("/api/").Subrouter()

	sr.Use(h.AuthMiddleware)

	sr.HandleFunc("/users.get/{id}", h.handleGetUser).Methods("GET")
	sr.HandleFunc("/users.get", h.handleGetUsers).Methods("GET")
	sr.HandleFunc("/users.set-setting", h.handleSetUserSettings).Methods("POST")
	sr.Handle("/users.create", RequirePermission(h, "manage-users", http.HandlerFunc(h.handleCreateUser))).Methods("POST")
	sr.Handle("/users.count", RequirePermission(h, "view-all-users", http.HandlerFunc(h.handleCountUsers))).Methods("GET")

	sr.HandleFunc("/private-settings.get", h.handleGetPrivateSettings).Methods("GET")
	sr.Handle("/settings.set", RequirePermission(h, "edit-private-settings", http.HandlerFunc(h.handleSetSettings))).Methods("POST")

	sr.HandleFunc("/permissions.get", h.handleGetPermissions).Methods("GET")
	sr.Handle("/permissions.toggle-role", RequirePermission(h, "manage-permissions", http.HandlerFunc(h.handleToggleRole))).Methods("POST")

	sr.HandleFunc("/roles.get", h.handleGetRoles).Methods("GET")
	sr.Handle("/roles.create", RequirePermission(h, "manage-roles", http.HandlerFunc(h.handleCreateRole))).Methods("POST")
	sr.Handle("/roles.update", RequirePermission(h, "manage-roles", http.HandlerFunc(h.handleUpdateRole))).Methods("PATCH")
	sr.Handle("/roles.delete", RequirePermission(h, "manage-roles", http.HandlerFunc(h.handleDeleteRole))).Methods("DELETE")

	r.HandleFunc("/api/auth/login", h.handleLogin).Methods("POST")
	r.HandleFunc("/api/auth/refresh", h.handleRefresh).Methods("POST")
}

func (h *GatewayHandler) getUserClaims(r *http.Request) (*pkg_type.UserClaims, error) {
	claims, ok := r.Context().Value(userClaimsKey).(*pkg_type.UserClaims)
	if !ok || claims == nil {
		return nil, fmt.Errorf("user claims not found")
	}
	return claims, nil
}

func parsePaginationRequest(r *http.Request) map[string]interface{} {
	payload := make(map[string]interface{})

	if page := r.URL.Query().Get("page"); page != "" {
		if p, err := strconv.Atoi(page); err == nil {
			payload["page"] = p
		}
	} else {
		payload["page"] = 1
	}

	if pageSize := r.URL.Query().Get("pageSize"); pageSize != "" {
		if ps, err := strconv.Atoi(pageSize); err == nil {
			payload["pageSize"] = ps
		}
	} else {
		payload["pageSize"] = 10
	}

	if searchQuery := r.URL.Query().Get("searchQuery"); searchQuery != "" {
		payload["searchQuery"] = searchQuery
	}

	if sortQuery := r.URL.Query().Get("sortQuery"); sortQuery != "" {
		payload["sortQuery"] = sortQuery
	}

	return payload
}

// --- HTTP handlers ---
func (h *GatewayHandler) handleGetUser(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]

	claims, err := h.getUserClaims(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	if id == "me" {
		id = claims.UserID
	}

	if id != claims.UserID && !h.PermissionProvider.CheckPermission("view-all-users", claims.Roles) {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	h.forwardRequest(w, r, h.AccountClient, "account-service", "users.get.id", map[string]interface{}{"id": id})
}

func (h *GatewayHandler) handleGetUsers(w http.ResponseWriter, r *http.Request) {
	claims, err := h.getUserClaims(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	isSmall := r.URL.Query().Get("isSmall")
	if isSmall != "true" && !h.PermissionProvider.CheckPermission("view-all-users", claims.Roles) {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	payload := parsePaginationRequest(r)

	payload["isSmall"] = isSmall == "true"
	if excludedIds := r.URL.Query()["excludedIds"]; len(excludedIds) > 0 {
		payload["excludedIds"] = excludedIds
	}

	h.forwardRequest(w, r, h.AccountClient, "account-service", "users.get", payload)
}

func (h *GatewayHandler) handleSetUserSettings(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(userClaimsKey).(*pkg_type.UserClaims)
	if !ok || claims == nil {
		http.Error(w, "user claims not found", http.StatusUnauthorized)
		return
	}

	var input map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	input["userId"] = claims.UserID

	h.forwardRequest(w, r, h.AccountClient, "account-service", "users.set-setting", input)
}

func (h *GatewayHandler) handleCreateUser(w http.ResponseWriter, r *http.Request) {
	var input map[string]interface{}
	json.NewDecoder(r.Body).Decode(&input)
	h.forwardRequest(w, r, h.AccountClient, "account-service", "users.create", input)
}

func (h *GatewayHandler) handleCountUsers(w http.ResponseWriter, r *http.Request) {
	searchQuery := r.URL.Query().Get("searchQuery")
	input := map[string]interface{}{
		"searchQuery": searchQuery,
	}
	h.forwardRequest(w, r, h.AccountClient, "account-service", "users.count", input)
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

	if blocked := h.LoginLimiter.IsBlocked(input.Username, r.RemoteAddr); blocked {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusTooManyRequests)
		json.NewEncoder(w).Encode(map[string]string{"error": "too many login attempts, wait"})
		return
	}

	resp, err := h.AccountClient.Request(r.Context(), "account-service", "login", input)
	w.Header().Set("Content-Type", "application/json")

	if err != nil {
		h.LoginLimiter.IncrementFailed(input.Username, r.RemoteAddr)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	if len(resp) == 0 || string(resp) == "null" {
		w.Write([]byte("{}"))
		return
	}

	h.LoginLimiter.Reset(input.Username, r.RemoteAddr)

	w.Write(resp)
}

func (h *GatewayHandler) handleRefresh(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("refreshToken")
	if err != nil {
		http.Error(w, "refresh token not found", http.StatusUnauthorized)
		return
	}

	input := map[string]interface{}{
		"refreshToken": cookie.Value,
	}

	h.forwardRequest(w, r, h.AccountClient, "account-service", "refresh", input)
}

func (h *GatewayHandler) handleSetSettings(w http.ResponseWriter, r *http.Request) {
	var input map[string]interface{}
	json.NewDecoder(r.Body).Decode(&input)
	h.forwardRequest(w, r, h.PolicyClient, "policy-service", "settings.set", input)
}

func (h *GatewayHandler) handleGetPrivateSettings(w http.ResponseWriter, r *http.Request) {
	h.forwardRequest(w, r, h.PolicyClient, "policy-service", "settings.get-private", nil)
}

func (h *GatewayHandler) handleGetPermissions(w http.ResponseWriter, r *http.Request) {
	h.forwardRequest(w, r, h.PolicyClient, "policy-service", "permissions.get", nil)
}

func (h *GatewayHandler) handleToggleRole(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	permissionID := q.Get("id")
	roleID := q.Get("value")

	payload := map[string]interface{}{
		"permissionId": permissionID,
		"roleId":       roleID,
	}

	h.forwardRequest(w, r, h.PolicyClient, "policy-service", "permissions.toggle-role", payload)
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
