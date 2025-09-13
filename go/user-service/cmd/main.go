package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/fx"

	"github.com/wybin4/flowledge/go/pkg/kafka"
	user "github.com/wybin4/flowledge/go/user-service/internal"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	_ "github.com/wybin4/flowledge/go/user-service/cmd/docs"
)

// --- Роуты Gin ---
func registerRoutes(handler *user.Handler) {
	r := gin.Default()

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "time": time.Now()})
	})

	r.GET("/users.get/:id", handler.GetUser)
	r.POST("/users.create", handler.CreateUser)
	r.PUT("/users.update/:id", handler.UpdateUser)
	r.PUT("/users/:id/settings", handler.UpdateSettings)
	r.DELETE("/users.delete/:id", handler.DeleteUser)

	log.Println("Starting server on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}

func main() {
	app := fx.New(
		fx.Provide(
			// Mongo
			func() (*mongo.Client, error) {
				clientOpts := options.Client().ApplyURI("mongodb://127.0.0.1:27017/flowledge?directConnection=true&serverSelectionTimeoutMS=2000")
				return mongo.Connect(context.Background(), clientOpts)
			},
			// Репозиторий
			func(client *mongo.Client) *user.Repository {
				return user.NewRepository(client, "flowledge")
			},
			// Password сервис
			user.NewUserPasswordService,
			// Kafka продьюсер
			func() (*kafka.Producer, error) {
				p, err := kafka.NewProducer("localhost:9092", "user-changed", 3) // 3 партиции
				if err != nil {
					return nil, fmt.Errorf("failed to create Kafka producer: %w", err)
				}
				return p, nil
			},
			// UserEventService
			func(p *kafka.Producer) *user.UserEventService {
				return user.NewUserEventService(p, "user-changed")
			},
			// Сервис пользователя
			func(repo *user.Repository, ps *user.UserPasswordService, es *user.UserEventService) *user.Service {
				return user.NewService(repo, ps, es) // <-- передаем eventSvc
			},
			// Handler
			func(svc *user.Service) *user.Handler {
				return user.NewHandler(svc)
			},
		),
		// Lifecycle для Mongo и запуска Gin
		fx.Invoke(func(lc fx.Lifecycle, client *mongo.Client, handler *user.Handler) {
			lc.Append(fx.Hook{
				OnStart: func(ctx context.Context) error {
					log.Println("Mongo connected successfully")
					go registerRoutes(handler)
					return nil
				},
				OnStop: func(ctx context.Context) error {
					log.Println("Disconnecting Mongo...")
					return client.Disconnect(ctx)
				},
			})
		}),
	)

	app.Run()
}
