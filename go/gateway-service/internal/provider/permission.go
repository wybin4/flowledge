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
	client  *transport.ServiceClient[GetPermissionResponse]
}

func NewPermissionsProvider(client *transport.ServiceClient[GetPermissionResponse], manager *transport.ResourceManager[GetPermissionResponse]) *PermissionsProvider {
	p := &PermissionsProvider{
		client:  client,
		manager: manager,
	}

	return p
}

func (p *PermissionsProvider) LoadPermissions() {
	ctx := context.Background()
	var raw map[string]interface{}

	for i := 0; i < 3; i++ {
		data, err := p.client.Request(ctx, "policy-service", "permissions.get", nil)
		if err != nil {
			log.Printf("Failed to load permissions (attempt %d): %v", i+1, err)
			time.Sleep(2 * time.Second)
			continue
		}

		if err := json.Unmarshal(data, &raw); err != nil {
			log.Printf("Failed to unmarshal permissions: %v", err)
			time.Sleep(2 * time.Second)
			continue
		}

		break
	}

	payload, ok := raw["payload"].([]interface{})
	if !ok {
		log.Println("Permissions payload missing or wrong type")
		return
	}

	for _, item := range payload {
		objBytes, err := json.Marshal(item)
		if err != nil {
			log.Printf("Failed to marshal permission item: %v", err)
			continue
		}

		var perm GetPermissionResponse
		if err := json.Unmarshal(objBytes, &perm); err != nil {
			log.Printf("Failed to unmarshal permission item: %v", err)
			continue
		}

		p.manager.Set(perm.ID, perm)
	}

	log.Println("Permissions loaded successfully")
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
