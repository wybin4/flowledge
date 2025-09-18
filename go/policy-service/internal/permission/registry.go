package permission

import (
	"context"
	"log"
	"strings"

	"github.com/wybin4/flowledge/go/policy-service/internal/role"
)

type PermissionRegistry struct {
	Repo *PermissionRepository
}

func NewPermissionRegistry(permissionRepo *PermissionRepository) *PermissionRegistry {
	return &PermissionRegistry{
		Repo: permissionRepo,
	}
}

func (r *PermissionRegistry) AddMissingPermissions(ctx context.Context) error {
	defaultPermissions := []Permission{
		{ID: "view-private-settings", Roles: []string{strings.ToLower(string(role.ADMIN))}},
		{ID: "edit-private-settings", Roles: []string{strings.ToLower(string(role.ADMIN))}},
		{ID: "view-all-permissions", Roles: []string{strings.ToLower(string(role.ADMIN))}},
		{ID: "manage-permissions", Roles: []string{strings.ToLower(string(role.ADMIN))}},
		{ID: "view-all-courses", Roles: []string{strings.ToLower(string(role.ADMIN))}},
		{ID: "view-assigned-courses", Roles: []string{
			strings.ToLower(string(role.ADMIN)),
			strings.ToLower(string(role.EDITOR)),
			strings.ToLower(string(role.OWNER)),
			strings.ToLower(string(role.MODERATOR)),
			strings.ToLower(string(role.USER)),
		}},
		{ID: "edit-course", Roles: []string{
			strings.ToLower(string(role.ADMIN)),
			strings.ToLower(string(role.EDITOR)),
			strings.ToLower(string(role.OWNER)),
			strings.ToLower(string(role.MODERATOR)),
		}},
		{ID: "delete-course", Roles: []string{
			strings.ToLower(string(role.ADMIN)),
			strings.ToLower(string(role.EDITOR)),
			strings.ToLower(string(role.OWNER)),
		}},
		{ID: "create-course", Roles: []string{
			strings.ToLower(string(role.ADMIN)),
			strings.ToLower(string(role.EDITOR)),
		}},
		{ID: "view-subscribers", Roles: []string{
			strings.ToLower(string(role.ADMIN)),
			strings.ToLower(string(role.EDITOR)),
			strings.ToLower(string(role.OWNER)),
			strings.ToLower(string(role.MODERATOR)),
		}},
		{ID: "manage-subscribers", Roles: []string{
			strings.ToLower(string(role.ADMIN)),
			strings.ToLower(string(role.EDITOR)),
			strings.ToLower(string(role.OWNER)),
		}},
		{ID: "view-own-statistics", Roles: []string{strings.ToLower(string(role.USER))}},
		{ID: "view-course-statistics", Roles: []string{
			strings.ToLower(string(role.ADMIN)),
			strings.ToLower(string(role.EDITOR)),
			strings.ToLower(string(role.OWNER)),
			strings.ToLower(string(role.MODERATOR)),
		}},
		{ID: "view-tags", Roles: []string{
			strings.ToLower(string(role.ADMIN)),
			strings.ToLower(string(role.EDITOR)),
		}},
		{ID: "manage-tags", Roles: []string{strings.ToLower(string(role.ADMIN))}},
		{ID: "view-all-users", Roles: []string{
			strings.ToLower(string(role.ADMIN)),
			strings.ToLower(string(role.EDITOR)),
		}},
		{ID: "manage-users", Roles: []string{strings.ToLower(string(role.ADMIN))}},
		{ID: "view-integrations", Roles: []string{strings.ToLower(string(role.ADMIN))}},
		{ID: "manage-integrations", Roles: []string{strings.ToLower(string(role.ADMIN))}},
		{ID: "manage-roles", Roles: []string{strings.ToLower(string(role.ADMIN))}},
		{ID: "manage-moderators", Roles: []string{
			strings.ToLower(string(role.ADMIN)),
			strings.ToLower(string(role.EDITOR)),
			strings.ToLower(string(role.OWNER)),
		}},
		{ID: "manage-owners", Roles: []string{
			strings.ToLower(string(role.ADMIN)),
			strings.ToLower(string(role.EDITOR)),
		}},
	}

	existingPermissions, err := r.Repo.FindAll(ctx)
	if err != nil {
		return err
	}

	existingPermissionIDs := make(map[string]struct{})
	for _, perm := range existingPermissions {
		existingPermissionIDs[perm.ID] = struct{}{}
	}

	var permissionsToAdd []Permission
	for _, perm := range defaultPermissions {
		if _, exists := existingPermissionIDs[perm.ID]; !exists {
			permissionsToAdd = append(permissionsToAdd, perm)
		}
	}

	if len(permissionsToAdd) > 0 {
		log.Printf("Adding missing permissions: %v", permissionsToAdd)
		if err := r.Repo.SaveAll(ctx, permissionsToAdd); err != nil {
			return err
		}
	}

	return nil
}
