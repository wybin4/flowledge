package user

import (
	"context"
	"time"

	user_model "github.com/wybin4/flowledge/go/account-service/internal/user/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type UserRepository struct {
	collection *mongo.Collection
}

func NewUserRepository(client *mongo.Client, dbName string) *UserRepository {
	return &UserRepository{
		collection: client.Database(dbName).Collection("users"),
	}
}

func (r *UserRepository) Collection() *mongo.Collection {
	return r.collection
}

func (r *UserRepository) FindByID(ctx context.Context, id string) (*user_model.User, error) {
	var user user_model.User
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	return &user, err
}

func (r *UserRepository) FindByUsername(ctx context.Context, username string) (*user_model.User, error) {
	var user user_model.User
	err := r.collection.FindOne(ctx, bson.M{"username": username}).Decode(&user)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	return &user, err
}

func (r *UserRepository) Create(ctx context.Context, user *user_model.User) error {
	_, err := r.collection.InsertOne(ctx, user)
	return err
}

func (r *UserRepository) Update(ctx context.Context, user *user_model.User) error {
	user.UpdatedAt = time.Now()
	_, err := r.collection.ReplaceOne(ctx, bson.M{"_id": user.ID}, user)
	return err
}

func (r *UserRepository) Delete(ctx context.Context, id string) error {
	_, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}

func (r *UserRepository) CountByUsernameContainingIgnoreCase(ctx context.Context, username string) (int64, error) {
	filter := bson.M{}
	if username != "" {
		filter["username"] = bson.M{"$regex": username, "$options": "i"}
	}
	return r.collection.CountDocuments(ctx, filter)
}

func (r *UserRepository) FindAllExcludingIDs(ctx context.Context, excludedIDs []string, searchQuery string, limit int) ([]user_model.User, error) {
	filter := bson.M{}
	if searchQuery != "" {
		filter["username"] = bson.M{"$regex": searchQuery, "$options": "i"}
	}
	if len(excludedIDs) > 0 {
		filter["_id"] = bson.M{"$nin": excludedIDs}
	}

	opts := options.Find().SetLimit(int64(limit))
	var users []user_model.User
	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	if err := cursor.All(ctx, &users); err != nil {
		return nil, err
	}

	return users, nil
}
