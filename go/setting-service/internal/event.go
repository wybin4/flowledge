package setting

import "github.com/wybin4/flowledge/go/pkg/kafka/producer"

type SettingEventService struct {
	eventService *producer.EventService
}

func NewSettingEventService(eventService *producer.EventService) *SettingEventService {
	return &SettingEventService{eventService: eventService}
}

// SendSettingEvent отправляет событие о настройке в Kafka
func (s *SettingEventService) SendSettingEvent(action string, setting *SettingModel) {
	if setting == nil {
		return
	}

	payload := map[string]interface{}{
		"action": action,
		"setting": map[string]interface{}{
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
	}

	s.eventService.SendAsync(setting.ID, payload)
}
