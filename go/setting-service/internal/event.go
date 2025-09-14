package setting

import (
	"encoding/json"
	"time"

	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/google/uuid"
)

type SettingEventService struct {
	publisher message.Publisher // ✅ БЕЗ указателя!
	topic     string
}

func NewSettingEventService(publisher message.Publisher) *SettingEventService {
	return &SettingEventService{
		publisher: publisher,
		topic:     "setting-events",
	}
}

// SendSettingEvent отправляет событие о пользователе через Watermill
func (s *SettingEventService) SendSettingEvent(action string, setting *Setting) {
	if s.publisher == nil || setting == nil {
		return
	}

	event := map[string]interface{}{
		"action": action,
		"setting": map[string]interface{}{
			"id":       setting.ID,
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
	s.publisher.Publish(s.topic, msg) // ✅ Теперь будет работать
}