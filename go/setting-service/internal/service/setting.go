package setting_service

import (
	"context"
	"regexp"
	"time"

	setting "github.com/wybin4/flowledge/go/setting-service/internal"
	setting_model "github.com/wybin4/flowledge/go/setting-service/internal/model"
)

type SettingService struct {
	repo     *setting.SettingRepository
	eventSvc *SettingEventService
}

func NewSettingService(repo *setting.SettingRepository, es *SettingEventService) *SettingService {
	return &SettingService{
		repo:     repo,
		eventSvc: es,
	}
}

func (s *SettingService) GetSettingsByPattern(ctx context.Context, pattern string) (map[string]interface{}, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	settings, err := s.repo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	re, err := regexp.Compile(pattern)
	if err != nil {
		return nil, err
	}

	result := make(map[string]interface{})
	for _, st := range settings {
		if re.MatchString(st.ID) {
			result[st.ID] = st.Value
		}
	}

	return result, nil
}

// Получение всех приватных настроек
func (s *SettingService) GetPrivateSettings(ctx context.Context) ([]*setting_model.Setting, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	settings, err := s.repo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	// Преобразуем []setting_model.Setting -> []*setting_model.Setting
	result := make([]*setting_model.Setting, len(settings))
	for i := range settings {
		result[i] = &settings[i]
	}

	return result, nil
}

// Получение всех публичных настроек
func (s *SettingService) GetPublicSettings(ctx context.Context) ([]*setting_model.Setting, error) {
	all, err := s.GetPrivateSettings(ctx)
	if err != nil {
		return nil, err
	}

	public := make([]*setting_model.Setting, 0, len(all))
	for _, s := range all {
		if s.Public {
			public = append(public, s)
		}
	}
	return public, nil
}

// Создание или обновление настройки
func (s *SettingService) SetSettings(ctx context.Context, id string, value interface{}) (*setting_model.Setting, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	updated, err := s.repo.UpdateValue(ctx, id, value)
	if err != nil {
		return nil, err
	}

	go s.eventSvc.SendSettingEvent("update", updated)

	return updated, nil
}
