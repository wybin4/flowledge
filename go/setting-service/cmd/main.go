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

	"github.com/wybin4/flowledge/go/pkg/kafka/producer"
	setting "github.com/wybin4/flowledge/go/setting-service/internal"
)

// --- Роуты Gin ---
func registerRoutes(handler *setting.Handler) {
	r := gin.Default()

	// Healthcheck
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "time": time.Now()})
	})

	// Private settings
	r.GET("/private-settings.get", handler.GetPrivateSettings)
	r.GET("/public-settings.get", handler.GetPublicSettings)
	r.POST("/settings.set", handler.SetSettings)

	log.Println("Starting setting-service on :8083")
	if err := r.Run(":8083"); err != nil {
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
			func() (*producer.Producer, error) {
				p, err := producer.NewProducer("localhost:9092", "setting-changed", 3)
				if err != nil {
					return nil, fmt.Errorf("failed to create Kafka producer: %w", err)
				}
				return p, nil
			},
			func(p *producer.Producer) *setting.SettingEventService {
				es := producer.NewEventService(p, "setting-changed")
				return setting.NewSettingEventService(es)
			},
			// Репозиторий
			func(client *mongo.Client) *setting.Repository {
				return setting.NewRepository(client, "flowledge")
			},
			// Handler
			func(repo *setting.Repository, es *setting.SettingEventService) *setting.Handler {
				return setting.NewHandler(repo, es)
			},
		),
		// Lifecycle для Mongo и запуска Gin
		fx.Invoke(func(lc fx.Lifecycle, client *mongo.Client, handler *setting.Handler) {
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
