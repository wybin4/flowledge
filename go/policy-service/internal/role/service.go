package role

import (
	"context"
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

func (s *RoleService) CreateRole(ctx context.Context, id, description string, scopes []RoleScope) (*Role, error) {
	role := &Role{
		ID:          id,
		Description: description,
		Scopes:      scopes,
	}
	if err := s.repo.Create(ctx, role); err != nil {
		return nil, err
	}
	return role, nil
}

func (s *RoleService) UpdateRole(ctx context.Context, id, description string, scopes []RoleScope) (*Role, error) {
	role, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if description != "" {
		role.Description = description
	}
	role.Scopes = scopes

	if err := s.repo.Update(ctx, role); err != nil {
		return nil, err
	}
	return role, nil
}

func (s *RoleService) DeleteRole(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
