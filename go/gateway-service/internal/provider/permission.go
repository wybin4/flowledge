package gateway_provider

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/wybin4/flowledge/go/pkg/transport"
)

type GetPermissionResponse struct {
	ID    string   `json:"id"`
	Roles []string `json:"roles"`
}

type PermissionsProvider struct {
	manager *transport.ResourceManager[GetPermissionResponse]
	client  *transport.Client
}

func NewPermissionsProvider(client *transport.Client, manager *transport.ResourceManager[GetPermissionResponse]) *PermissionsProvider {
	p := &PermissionsProvider{
		client:  client,
		manager: manager,
	}

	return p
}

func (p *PermissionsProvider) LoadPermissions() {
	ctx := context.Background()

	for i := 0; i < 3; i++ {
		data, err := p.client.Request(ctx, "policy-service", "permissions.get", nil)
		if err != nil {
			log.Printf("Failed to load permissions (attempt %d): %v", i+1, err)
			time.Sleep(2 * time.Second)
			continue
		}

		var permissions []GetPermissionResponse
		if err := json.Unmarshal(data, &permissions); err != nil {
			log.Printf("Failed to unmarshal permissions response: %v", err)
			time.Sleep(2 * time.Second)
			continue
		}

		for _, perm := range permissions {
			p.manager.Set(perm.ID, perm)
		}

		log.Println("Permissions loaded successfully")
		return
	}

	log.Println("Failed to load permissions after 3 attempts")
}

func (p *PermissionsProvider) CheckPermission(permID string, userRoles []string) bool {
	perm, ok := p.manager.Get(permID)
	if !ok {
		return false
	}

	userRoleSet := make(map[string]struct{}, len(userRoles))
	for _, r := range userRoles {
		userRoleSet[r] = struct{}{}
	}

	for _, r := range perm.Roles {
		if _, exists := userRoleSet[r]; exists {
			return true
		}
	}

	return false
}
