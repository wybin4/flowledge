package setting_service

import (
	"context"
	"time"

	setting "github.com/wybin4/flowledge/go/policy-service/internal/setting"
	setting_model "github.com/wybin4/flowledge/go/policy-service/internal/setting/model"
	"go.mongodb.org/mongo-driver/bson"
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

	filter := bson.M{
		"_id": bson.M{
			"$regex":   pattern,
			"$options": "i",
		},
	}

	cursor, err := s.repo.Collection().Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var settings []struct {
		ID    string      `bson:"_id"`
		Value interface{} `bson:"value"`
	}

	if err := cursor.All(ctx, &settings); err != nil {
		return nil, err
	}

	result := make(map[string]interface{}, len(settings))
	for _, s := range settings {
		result[s.ID] = s.Value
	}

	return result, nil
}

func (s *SettingService) GetPrivateSettings(ctx context.Context) ([]*setting_model.Setting, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	settings, err := s.repo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

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
