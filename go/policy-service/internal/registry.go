package policy_registry

import (
	"context"

	"github.com/wybin4/flowledge/go/policy-service/internal/permission"
	"github.com/wybin4/flowledge/go/policy-service/internal/role"
	"github.com/wybin4/flowledge/go/policy-service/internal/setting"
)

func InitializeDefaults(ctx context.Context, pr *permission.PermissionRegistry, rr *role.RoleRegistry, sr *setting.SettingRegistry) error {
	if err := rr.AddMissingRoles(ctx); err != nil {
		return err
	}
	if err := pr.AddMissingPermissions(ctx); err != nil {
		return err
	}
	if err := sr.AddMissingSettings(ctx); err != nil {
		return err
	}
	return nil
}
