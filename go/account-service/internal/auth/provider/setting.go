package auth_provider

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/wybin4/flowledge/go/pkg/transport"
)

type GetSettingResponse struct {
	ID    string      `json:"id"`
	Value interface{} `json:"value"`
}

type LDAPSettingProvider struct {
	manager *transport.ResourceManager[GetSettingResponse]
	client  *transport.ServiceClient[GetSettingResponse]
}

func NewLDAPSettingProvider(
	client *transport.ServiceClient[GetSettingResponse],
	manager *transport.ResourceManager[GetSettingResponse],
	sub message.Subscriber,
) *LDAPSettingProvider {

	p := &LDAPSettingProvider{
		client:  client,
		manager: manager,
	}

	go p.loadInitialSettings()

	p.client.SubscribeEvents(sub, manager, func(s GetSettingResponse) string { return s.ID }, "setting-events")

	return p
}

func (p *LDAPSettingProvider) loadInitialSettings() {
	ctx := context.Background()

	for i := 0; i < 3; i++ {
		data, err := p.client.Request(ctx, "policy-service", "settings.get", map[string]string{"pattern": "^ldap\\."})
		if err != nil {
			log.Printf("Failed to load LDAP settings (attempt %d): %v", i+1, err)
			time.Sleep(2 * time.Second)
			continue
		}

		var payload map[string]interface{}
		if err := json.Unmarshal(data, &payload); err != nil {
			log.Printf("Failed to unmarshal LDAP settings: %v", err)
			time.Sleep(2 * time.Second)
			continue
		}

		for id, value := range payload {
			p.manager.Set(id, GetSettingResponse{
				ID:    id,
				Value: value,
			})
		}

		log.Println("LDAP settings loaded successfully:")
		return
	}

	log.Println("Failed to load LDAP settings after 3 attempts")
}

func (p *LDAPSettingProvider) Get(key string) interface{} {
	if val, ok := p.manager.Get(key); ok {
		return val.Value
	}
	return nil
}
