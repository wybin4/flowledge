package user

import (
	"context"
	"time"

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

func (r *Repository) FindByID(ctx context.Context, id string) (*model.UserModel, error) {
	var user model.UserModel
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	return &user, err
}

func (r *Repository) FindByUsername(ctx context.Context, username string) (*model.UserModel, error) {
	var user model.UserModel
	err := r.collection.FindOne(ctx, bson.M{"username": username}).Decode(&user)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	return &user, err
}

func (r *Repository) Create(ctx context.Context, user *model.UserModel) error {
	_, err := r.collection.InsertOne(ctx, user)
	return err
}

func (r *Repository) Update(ctx context.Context, user *model.UserModel) error {
	user.UpdatedAt = time.Now()
	_, err := r.collection.ReplaceOne(ctx, bson.M{"_id": user.ID}, user)
	return err
}

func (r *Repository) Delete(ctx context.Context, id string) error {
	_, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}
