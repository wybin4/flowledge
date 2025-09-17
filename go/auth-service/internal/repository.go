package auth

import (
	"context"
	"fmt"

	model "github.com/wybin4/flowledge/go/pkg/types"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Repository struct {
	collection *mongo.Collection
}

func NewRepository(client *mongo.Client, dbName string) *Repository {
	return &Repository{
		collection: client.Database(dbName).Collection("users"),
	}
}

// UpdateField обновляет одно поле у пользователя по ID
func (r *Repository) UpdateField(ctx context.Context, userID string, field string, value interface{}) error {
	if userID == "" {
		return fmt.Errorf("userID is empty")
	}
	if field == "" {
		return fmt.Errorf("field is empty")
	}

	filter := map[string]interface{}{"_id": userID}
	update := map[string]interface{}{
		"$set": map[string]interface{}{
			field: value,
		},
	}

	_, err := r.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("failed to update user field %s: %w", field, err)
	}

	return nil
}

func (r *Repository) FindByUsername(ctx context.Context, username string) (*model.UserModel, error) {
	var user model.UserModel
	err := r.collection.FindOne(ctx, bson.M{"username": username}).Decode(&user)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	return &user, err
}
