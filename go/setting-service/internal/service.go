package setting

import (
	"context"
	"regexp"
	"time"
)

type SettingService struct {
	repo     *Repository
	eventSvc *SettingEventService
}

func NewSettingService(repo *Repository, es *SettingEventService) *SettingService {
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
func (s *SettingService) GetPrivateSettings(ctx context.Context) ([]*Setting, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	settings, err := s.repo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	// Преобразуем []Setting -> []*Setting
	result := make([]*Setting, len(settings))
	for i := range settings {
		result[i] = &settings[i]
	}

	return result, nil
}

// Получение всех публичных настроек
func (s *SettingService) GetPublicSettings(ctx context.Context) ([]*Setting, error) {
	all, err := s.GetPrivateSettings(ctx)
	if err != nil {
		return nil, err
	}

	public := make([]*Setting, 0, len(all))
	for _, s := range all {
		if s.Public {
			public = append(public, s)
		}
	}
	return public, nil
}

// Создание или обновление настройки
func (s *SettingService) SetSettings(ctx context.Context, id string, value interface{}) (*Setting, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	updated, err := s.repo.UpdateValue(ctx, id, value)
	if err != nil {
		return nil, err
	}

	go s.eventSvc.SendSettingEvent("update", updated)

	return updated, nil
}
