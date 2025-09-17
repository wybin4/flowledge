package permission

import (
	"context"

	"github.com/wybin4/flowledge/go/policy-service/internal/role"
	"github.com/wybin4/flowledge/go/policy-service/internal/utils"
)

// PermissionService управляет пермишнами
type PermissionService struct {
	PermissionRepo *PermissionRepository
	RoleRepo       *role.RoleRepository
}

// Конструктор
func NewPermissionService(permissionRepo *PermissionRepository, roleRepo *role.RoleRepository) *PermissionService {
	return &PermissionService{
		PermissionRepo: permissionRepo,
		RoleRepo:       roleRepo,
	}
}

// GetPermissions возвращает все пермишны
func (s *PermissionService) GetPermissions(ctx context.Context) ([]Permission, error) {
	return s.PermissionRepo.FindAll(ctx)
}

// TogglePermissionRole добавляет или удаляет роль из пермишна
func (s *PermissionService) TogglePermissionRole(ctx context.Context, permissionID, roleID string) error {
	// Проверяем существование роли
	_, err := s.RoleRepo.FindByID(ctx, roleID)
	if err != nil {
		return utils.ErrRoleNotFound
	}

	// Получаем пермишн
	permission, err := s.PermissionRepo.FindByID(ctx, permissionID)
	if err != nil {
		return utils.ErrPermissionNotFound
	}

	// Обновляем роли
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

	// Сохраняем изменения
	return s.PermissionRepo.Save(ctx, permission)
}
