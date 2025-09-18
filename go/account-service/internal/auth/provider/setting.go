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

	// Асинхронная загрузка начальных настроек
	go p.loadInitialSettings()

	// Подписка на события обновления
	p.client.SubscribeEvents(sub, manager, func(s GetSettingResponse) string { return s.ID }, "setting-events")

	return p
}

func (p *LDAPSettingProvider) loadInitialSettings() {
	ctx := context.Background()
	var raw map[string]interface{}

	for i := 0; i < 3; i++ {
		data, err := p.client.Request(ctx, "policy-service", "settings.get", map[string]string{"pattern": "^ldap\\."})
		if err != nil {
			log.Printf("Failed to load LDAP settings (attempt %d): %v", i+1, err)
			time.Sleep(2 * time.Second)
			continue
		}

		if err := json.Unmarshal(data, &raw); err != nil {
			log.Printf("Failed to unmarshal LDAP settings: %v", err)
			time.Sleep(2 * time.Second)
			continue
		}

		break
	}

	payload, ok := raw["payload"].(map[string]interface{})
	if !ok {
		log.Println("LDAP settings payload missing or wrong type")
		return
	}

	for k, v := range payload {
		p.manager.Set(k, GetSettingResponse{
			ID:    k,
			Value: v,
		})
	}

	log.Println("LDAP settings loaded successfully")
}

func (p *LDAPSettingProvider) Get(key string) interface{} {
	if val, ok := p.manager.Get(key); ok {
		return val.Value
	}
	return nil
}
