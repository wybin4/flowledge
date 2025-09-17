package role

import (
	"context"

	"github.com/google/uuid"
)

type RoleService struct {
	repo *RoleRepository
}

func NewRoleService(repo *RoleRepository) *RoleService {
	return &RoleService{repo: repo}
}

func (s *RoleService) GetRoles(ctx context.Context) ([]Role, error) {
	return s.repo.FindAll(ctx)
}

// CreateRole создаёт роль с набором скоупов
func (s *RoleService) CreateRole(ctx context.Context, name, description string, scopes []RoleScope) (*Role, error) {
	role := &Role{
		ID:          uuid.New().String(),
		Name:        name,
		Description: description,
		Scopes:      scopes,
	}
	if err := s.repo.Create(ctx, role); err != nil {
		return nil, err
	}
	return role, nil
}

// UpdateRole обновляет имя, описание и скоупы роли
func (s *RoleService) UpdateRole(ctx context.Context, id, newName, newDescription string, newScopes []RoleScope) (*Role, error) {
	role, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	role.Name = newName
	role.Description = newDescription
	role.Scopes = newScopes

	if err := s.repo.Update(ctx, role); err != nil {
		return nil, err
	}
	return role, nil
}

func (s *RoleService) DeleteRole(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
