package main

import (
	"context"
	"fmt"
	"log"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill-kafka/v2/pkg/kafka"
	"go.mongodb.org/mongo-driver/mongo"
	"go.uber.org/fx"

	store "github.com/wybin4/flowledge/go/pkg/db"
	"github.com/wybin4/flowledge/go/pkg/transport"
	policy "github.com/wybin4/flowledge/go/policy-service/internal"
	"github.com/wybin4/flowledge/go/policy-service/internal/permission"
	"github.com/wybin4/flowledge/go/policy-service/internal/role"
	setting "github.com/wybin4/flowledge/go/policy-service/internal/setting"
	setting_service "github.com/wybin4/flowledge/go/policy-service/internal/setting/service"
)

func main() {
	app := fx.New(
		fx.Provide(
			store.NewMongoClient,

			func(client *mongo.Client) *setting.SettingRepository {
				return setting.NewSettingRepository(client, "flowledge")
			},

			func(client *mongo.Client) *role.RoleRepository {
				return role.NewRoleRepository(client, "flowledge")
			},

			func(client *mongo.Client) *permission.PermissionRepository {
				return permission.NewPermissionRepository(client, "flowledge")
			},

			func() watermill.LoggerAdapter {
				return watermill.NewStdLogger(true, true)
			},

			transport.NewKafkaPublisher,
			func(logger watermill.LoggerAdapter) (*kafka.Subscriber, error) {
				return transport.NewKafkaSubscriber("policy-service-group", logger)
			},

			func(publisher *kafka.Publisher) *setting_service.SettingEventService {
				return setting_service.NewSettingEventService(publisher)
			},

			func(repo *setting.SettingRepository, es *setting_service.SettingEventService) *setting_service.SettingService {
				return setting_service.NewSettingService(repo, es)
			},

			func(repo *role.RoleRepository) *role.RoleService {
				return role.NewRoleService(repo)
			},

			func(permissionRepo *permission.PermissionRepository, roleRepo *role.RoleRepository) *permission.PermissionService {
				return permission.NewPermissionService(permissionRepo, roleRepo)
			},
		),
		fx.Invoke(func(
			lc fx.Lifecycle,
			settingSvc *setting_service.SettingService,
			roleSvc *role.RoleService,
			permSvc *permission.PermissionService,
			subscriber *kafka.Subscriber,
			publisher *kafka.Publisher,
			logger watermill.LoggerAdapter,
		) {
			lc.Append(fx.Hook{
				OnStart: func(ctx context.Context) error {
					go transport.StartServiceRouter(transport.RouterConfig{
						ServiceName:   "policy-service",
						Topic:         "policy.requests",
						ResponseTopic: "policy.responses",
						Subscriber:    subscriber,
						Publisher:     publisher,
						Logger:        logger,
						Handler: func(ctx context.Context, req transport.Request) (interface{}, error) {
							switch req.Endpoint {
							case "settings.get-private":
								return settingSvc.GetPrivateSettings(ctx)
							// case "settings.get-public":
							// 	return settingSvc.GetPublicSettings(ctx)
							case "settings.set":
								idVal, _ := req.Payload["id"].(string)
								value := req.Payload["value"]
								return settingSvc.SetSettings(ctx, idVal, value)
							case "settings.get":
								pattern, _ := req.Payload["pattern"].(string)
								return settingSvc.GetSettingsByPattern(ctx, pattern)
							case "permissions.get":
								return permSvc.GetPermissions(ctx)

							case "permissions.toggle-role":
								permissionID, _ := req.Payload["permissionId"].(string)
								roleID, _ := req.Payload["roleId"].(string)
								if permissionID == "" || roleID == "" {
									return nil, transport.ErrInvalidPayload
								}
								if err := permSvc.TogglePermissionRole(ctx, permissionID, roleID); err != nil {
									return nil, err
								}
								return nil, nil

							case "roles.get":
								return roleSvc.GetRoles(ctx)

							case "roles.create":
								roleName, _ := req.Payload["name"].(string)
								if roleName == "" {
									return nil, transport.ErrInvalidPayload
								}

								description, _ := req.Payload["description"].(string)

								rawScopes, ok := req.Payload["scopes"].([]interface{})
								if !ok {
									rawScopes = []interface{}{}
								}

								scopes := make([]role.RoleScope, 0, len(rawScopes))
								for _, s := range rawScopes {
									if str, ok := s.(string); ok {
										switch str {
										case string(role.RoleScopeUsers), string(role.RoleScopeCourses):
											scopes = append(scopes, role.RoleScope(str))
										}
									}
								}

								return roleSvc.CreateRole(ctx, roleName, description, scopes)

							case "roles.update":
								roleID, _ := req.Payload["id"].(string)
								newName, _ := req.Payload["name"].(string)
								if roleID == "" || newName == "" {
									return nil, transport.ErrInvalidPayload
								}

								newDescription, _ := req.Payload["description"].(string)

								rawScopes, ok := req.Payload["scopes"].([]interface{})
								if !ok {
									rawScopes = []interface{}{}
								}

								newScopes := make([]role.RoleScope, 0, len(rawScopes))
								for _, s := range rawScopes {
									if str, ok := s.(string); ok {
										switch str {
										case string(role.RoleScopeUsers), string(role.RoleScopeCourses):
											newScopes = append(newScopes, role.RoleScope(str))
										}
									}
								}

								return roleSvc.UpdateRole(ctx, roleID, newDescription, newScopes)

							case "roles.delete":
								roleID, _ := req.Payload["id"].(string)
								if roleID == "" {
									return nil, transport.ErrInvalidPayload
								}
								return nil, roleSvc.DeleteRole(ctx, roleID)

							default:
								return nil, fmt.Errorf("unknown endpoint: %s", req.Endpoint)
							}
						},
					})

					return nil
				},
			})
		}),

		fx.Invoke(func(
			lc fx.Lifecycle,
			roleRepo *role.RoleRepository,
			permRepo *permission.PermissionRepository,
			settingRepo *setting.SettingRepository,
		) {
			lc.Append(fx.Hook{
				OnStart: func(ctx context.Context) error {
					go func() {
						roleRegistry := role.NewRoleRegistry(roleRepo)
						permRegistry := permission.NewPermissionRegistry(permRepo)
						settingRegistry := setting.NewSettingRegistry(settingRepo)

						if err := policy.InitializeDefaults(ctx, permRegistry, roleRegistry, settingRegistry); err != nil {
							log.Printf("Failed to initialize defaults: %v", err)
							return
						}

						log.Println("Defaults initialized successfully")
					}()
					return nil
				},
			})
		}),
	)

	log.Println("\033[31mSetting service starting...\033[0m")
	app.Run()
}
