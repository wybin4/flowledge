package permission_service

import (
	"context"

	"github.com/wybin4/flowledge/go/policy-service/internal/permission"
	"github.com/wybin4/flowledge/go/policy-service/internal/role"
	"github.com/wybin4/flowledge/go/policy-service/internal/utils"
)

type PermissionService struct {
	PermissionRepo *permission.PermissionRepository
	RoleRepo       *role.RoleRepository
	EventSvc       *PermissionEventService
}

func NewPermissionService(permissionRepo *permission.PermissionRepository, roleRepo *role.RoleRepository, es *PermissionEventService) *PermissionService {
	return &PermissionService{
		PermissionRepo: permissionRepo,
		RoleRepo:       roleRepo,
		EventSvc:       es,
	}
}

func (s *PermissionService) GetPermissions(ctx context.Context) ([]permission.Permission, error) {
	return s.PermissionRepo.FindAll(ctx)
}

func (s *PermissionService) TogglePermissionRole(ctx context.Context, permissionID, roleID string) error {
	_, err := s.RoleRepo.FindByID(ctx, roleID)
	if err != nil {
		return utils.ErrRoleNotFound
	}

	permission, err := s.PermissionRepo.FindByID(ctx, permissionID)
	if err != nil {
		return utils.ErrPermissionNotFound
	}

	found := false
	newRoles := make([]string, 0, len(permission.Roles))
	for _, r := range permission.Roles {
		if r == roleID {
			found = true
			continue
		}
		newRoles = append(newRoles, r)
	}

	if !found {
		newRoles = append(newRoles, roleID)
	}

	permission.Roles = newRoles

	updated, err := s.PermissionRepo.Save(ctx, permission)
	if err != nil {
		return err
	}

	go s.EventSvc.SendPermissionEvent("update", updated)

	return nil
}
