package auth_provider

import (
	"context"
	"log"
	"time"

	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/wybin4/flowledge/go/pkg/transport"
)

type LDAPSettingProvider struct {
	settingsManager *transport.SettingsManager
	client          *transport.SettingsServiceClient
}

func NewLDAPSettingProvider(client *transport.SettingsServiceClient, manager *transport.SettingsManager, sub message.Subscriber) *LDAPSettingProvider {
	s := &LDAPSettingProvider{
		client:          client,
		settingsManager: manager,
	}

	// Асинхронная загрузка настроек
	go s.loadInitialSettings()

	// Подписка на события обновления
	s.client.SubscribeEvents(sub, manager)

	return s
}

func (s *LDAPSettingProvider) loadInitialSettings() {
	var values map[string]interface{}
	var err error

	for i := 0; i < 3; i++ {
		values, err = s.client.GetSettingsByPattern(context.Background(), `^ldap\.`)
		if err == nil {
			break
		}
		log.Printf("Failed to load LDAP settings (attempt %d): %v", i+1, err)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		log.Printf("Warning: Failed to load initial LDAP settings: %v", err)
		return
	}

	for k, v := range values {
		s.settingsManager.Set(k, v)
	}

	log.Println("LDAP settings loaded successfully")
}

func (s *LDAPSettingProvider) Get(key string) interface{} {
	val, _ := s.settingsManager.Get(key)
	return val
}
