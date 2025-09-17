package role

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var ErrRoleNotFound = errors.New("role not found")

type RoleRepository struct {
	collection *mongo.Collection
}

func NewRoleRepository(client *mongo.Client, dbName string) *RoleRepository {
	return &RoleRepository{
		collection: client.Database(dbName).Collection("roles"),
	}
}

func (r *RoleRepository) FindAll(ctx context.Context) ([]Role, error) {
	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var roles []Role
	if err := cursor.All(ctx, &roles); err != nil {
		return nil, err
	}
	return roles, nil
}

func (r *RoleRepository) FindByID(ctx context.Context, id string) (*Role, error) {
	var role Role
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&role)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, ErrRoleNotFound
		}
		return nil, err
	}
	return &role, nil
}

func (r *RoleRepository) Create(ctx context.Context, role *Role) error {
	_, err := r.collection.InsertOne(ctx, role)
	return err
}

func (r *RoleRepository) Update(ctx context.Context, role *Role) error {
	res, err := r.collection.ReplaceOne(ctx, bson.M{"_id": role.ID}, role)
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return ErrRoleNotFound
	}
	return nil
}

func (r *RoleRepository) Delete(ctx context.Context, id string) error {
	res, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return ErrRoleNotFound
	}
	return nil
}
