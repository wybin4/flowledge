package role

import (
	"context"
	"log"
	"strings"
)

type RoleRegistry struct {
	Repo *RoleRepository
}

func NewRoleRegistry(repo *RoleRepository) *RoleRegistry {
	return &RoleRegistry{Repo: repo}
}

func (r *RoleRegistry) AddMissingRoles(ctx context.Context) error {
	defaultRoles := []Role{
		{
			ID:          strings.ToLower(string(ADMIN)),
			Scopes:      []RoleScope{RoleScopeUsers},
		},
		{
			ID:          strings.ToLower(string(USER)),
			Scopes:      []RoleScope{RoleScopeUsers},
		},
		{
			ID:          strings.ToLower(string(EDITOR)),
			Scopes:      []RoleScope{RoleScopeUsers, RoleScopeCourses},
		},
		{
			ID:          strings.ToLower(string(OWNER)),
			Scopes:      []RoleScope{RoleScopeCourses},
		},
		{
			ID:          strings.ToLower(string(MODERATOR)),
			Scopes:      []RoleScope{RoleScopeCourses},
		},
	}

	existingRoles, err := r.Repo.FindAll(ctx)
	if err != nil {
		return err
	}

	existingRoleIDs := make(map[string]struct{}, len(existingRoles))
	for _, role := range existingRoles {
		existingRoleIDs[role.ID] = struct{}{}
	}

	for _, role := range defaultRoles {
		if _, exists := existingRoleIDs[role.ID]; !exists {
			log.Printf("Creating missing role: %s", role.ID)
			if err := r.Repo.Create(ctx, &role); err != nil {
				return err
			}
		}
	}

	return nil
}
