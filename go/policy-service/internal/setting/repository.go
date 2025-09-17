package setting

import (
	"context"

	setting_model "github.com/wybin4/flowledge/go/policy-service/internal/setting/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type SettingRepository struct {
	collection *mongo.Collection
}

func NewSettingRepository(client *mongo.Client, dbName string) *SettingRepository {
	return &SettingRepository{
		collection: client.Database(dbName).Collection("settings"),
	}
}

// FindAll возвращает все настройки
func (r *SettingRepository) FindAll(ctx context.Context) ([]setting_model.Setting, error) {
	cur, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var settings []setting_model.Setting
	if err := cur.All(ctx, &settings); err != nil {
		return nil, err
	}
	return settings, nil
}

// FindByID ищет настройку по _id
func (r *SettingRepository) FindByID(ctx context.Context, id string) (*setting_model.Setting, error) {
	var setting setting_model.Setting
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&setting)
	if err != nil {
		return nil, err
	}
	return &setting, nil
}

// UpdateValue обновляет значение
func (r *SettingRepository) UpdateValue(ctx context.Context, id string, value interface{}) (*setting_model.Setting, error) {
	filter := bson.M{"_id": id}
	update := bson.M{"$set": bson.M{"value": value}}

	_, err := r.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return nil, err
	}

	return r.FindByID(ctx, id)
}
