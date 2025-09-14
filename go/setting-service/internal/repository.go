package setting

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Repository struct {
	collection *mongo.Collection
}

func NewRepository(client *mongo.Client, dbName string) *Repository {
	return &Repository{
		collection: client.Database(dbName).Collection("settings"),
	}
}

// FindAll возвращает все настройки
func (r *Repository) FindAll(ctx context.Context) ([]Setting, error) {
	cur, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var settings []Setting
	if err := cur.All(ctx, &settings); err != nil {
		return nil, err
	}
	return settings, nil
}

// FindByID ищет настройку по _id
func (r *Repository) FindByID(ctx context.Context, id string) (*Setting, error) {
	var setting Setting
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&setting)
	if err != nil {
		return nil, err
	}
	return &setting, nil
}

// UpdateValue обновляет значение
func (r *Repository) UpdateValue(ctx context.Context, id string, value interface{}) (*Setting, error) {
	filter := bson.M{"_id": id}
	update := bson.M{"$set": bson.M{"value": value}}

	_, err := r.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return nil, err
	}

	return r.FindByID(ctx, id)
}
