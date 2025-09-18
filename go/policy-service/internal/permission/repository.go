package permission

import (
	"context"

	"github.com/wybin4/flowledge/go/policy-service/internal/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type PermissionRepository struct {
	collection *mongo.Collection
}

func NewPermissionRepository(client *mongo.Client, dbName string) *PermissionRepository {
	return &PermissionRepository{
		collection: client.Database(dbName).Collection("permissions"),
	}
}

// FindAll возвращает все пермишны
func (r *PermissionRepository) FindAll(ctx context.Context) ([]Permission, error) {
	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var perms []Permission
	if err := cursor.All(ctx, &perms); err != nil {
		return nil, err
	}
	return perms, nil
}

// FindByID возвращает пермишн по ID
func (r *PermissionRepository) FindByID(ctx context.Context, id string) (*Permission, error) {
	var perm Permission
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&perm)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, utils.ErrPermissionNotFound
		}
		return nil, err
	}
	return &perm, nil
}

// Save обновляет существующий пермишн или создаёт новый
func (r *PermissionRepository) Save(ctx context.Context, perm *Permission) error {
	opts := options.Replace().SetUpsert(true)
	_, err := r.collection.ReplaceOne(ctx, bson.M{"_id": perm.ID}, perm, opts)
	return err
}

// Delete удаляет пермишн по ID
func (r *PermissionRepository) Delete(ctx context.Context, id string) error {
	res, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return utils.ErrPermissionNotFound
	}
	return nil
}

func (r *PermissionRepository) SaveAll(ctx context.Context, perms []Permission) error {
	if len(perms) == 0 {
		return nil
	}

	var docs []interface{}
	for _, perm := range perms {
		docs = append(docs, perm)
	}

	_, err := r.collection.InsertMany(ctx, docs)
	return err
}
