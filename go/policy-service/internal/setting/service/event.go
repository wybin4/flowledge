package setting_service

import (
	"encoding/json"
	"time"

	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/google/uuid"
	setting_model "github.com/wybin4/flowledge/go/policy-service/internal/setting/model"
)

type SettingEventService struct {
	publisher message.Publisher
	topic     string
}

func NewSettingEventService(publisher message.Publisher) *SettingEventService {
	return &SettingEventService{
		publisher: publisher,
		topic:     "setting-events",
	}
}

func (s *SettingEventService) SendSettingEvent(action string, setting *setting_model.Setting) {
	if s.publisher == nil || setting == nil {
		return
	}

	event := map[string]interface{}{
		"action": action,
		"record": map[string]interface{}{
			"id":              setting.ID,
			"type":            setting.Type,
			"public":          setting.Public,
			"i18nLabel":       setting.I18nLabel,
			"value":           setting.Value.Val,
			"packageValue":    setting.PackageValue.Val,
			"options":         setting.Options,
			"i18nDescription": setting.I18nDescription,
			"enableQuery":     setting.EnableQuery,
			"displayQuery":    setting.DisplayQuery,
			"placeholder":     setting.Placeholder,
			"createdAt":       setting.CreatedAt,
			"updatedAt":       setting.UpdatedAt,
		},
		"timestamp": time.Now(),
	}

	eventBytes, err := json.Marshal(event)
	if err != nil {
		return
	}

	msg := message.NewMessage(uuid.NewString(), eventBytes)
	s.publisher.Publish(s.topic, msg)
}
