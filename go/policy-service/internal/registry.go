package policy

import (
	"context"

	"github.com/wybin4/flowledge/go/policy-service/internal/permission"
	"github.com/wybin4/flowledge/go/policy-service/internal/role"
)

func InitializeDefaultRolesAndPermissions(ctx context.Context, pr *permission.PermissionRegistry, rr *role.RoleRegistry) error {
	if err := rr.AddMissingRoles(ctx); err != nil {
		return err
	}
	if err := pr.AddMissingPermissions(ctx); err != nil {
		return err
	}
	return nil
}
