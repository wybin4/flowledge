package websocket

// import (
// 	"context"
// 	"encoding/json"
// 	"log"

// 	"github.com/ThreeDotsLabs/watermill"
// 	"github.com/ThreeDotsLabs/watermill/message"
// 	"github.com/ThreeDotsLabs/watermill/message/router/middleware"
// 	"github.com/ThreeDotsLabs/watermill/message/router/plugin"
// )

// type WatermillSubscriber struct {
// 	hub            *Hub
// 	userSubscriber message.Subscriber
// 	setSubscriber  message.Subscriber
// 	logger         watermill.LoggerAdapter
// 	router         *message.Router
// }

// func NewWatermillSubscriber(hub *Hub, userSub, settingSub message.Subscriber, logger watermill.LoggerAdapter) *WatermillSubscriber {
// 	return &WatermillSubscriber{
// 		hub:            hub,
// 		userSubscriber: userSub,
// 		setSubscriber:  settingSub,
// 		logger:         logger,
// 	}
// }

// func (s *WatermillSubscriber) Start(ctx context.Context) error {
// 	router, err := message.NewRouter(message.RouterConfig{}, s.logger)
// 	if err != nil {
// 		return err
// 	}

// 	router.AddMiddleware(
// 		middleware.Retry{MaxRetries: 3}.Middleware,
// 		middleware.Recoverer,
// 	)
// 	router.AddPlugin(plugin.SignalsHandler)

// 	// User events
// 	router.AddHandler(
// 		"user_events_handler",
// 		"user-events",
// 		s.userSubscriber,
// 		"",
// 		nil,
// 		func(msg *message.Message) ([]*message.Message, error) {
// 			var event struct {
// 				Action string                 `json:"action"`
// 				User   map[string]interface{} `json:"user"`
// 			}
// 			if err := json.Unmarshal(msg.Payload, &event); err != nil {
// 				log.Printf("Invalid user event: %v", err)
// 				msg.Ack()
// 				return nil, nil
// 			}
// 			if event.Action == "create" || event.Action == "update" || event.Action == "delete" {
// 				s.hub.Broadcast(event)
// 			}
// 			msg.Ack()
// 			return nil, nil
// 		},
// 	)

// 	// Setting events
// 	router.AddHandler(
// 		"setting_events_handler",
// 		"setting-events",
// 		s.setSubscriber,
// 		"",
// 		nil,
// 		func(msg *message.Message) ([]*message.Message, error) {
// 			var event map[string]interface{}
// 			if err := json.Unmarshal(msg.Payload, &event); err != nil {
// 				log.Printf("Invalid setting event: %v", err)
// 				msg.Ack()
// 				return nil, nil
// 			}
// 			s.hub.Broadcast(event)
// 			msg.Ack()
// 			return nil, nil
// 		},
// 	)

// 	s.router = router
// 	log.Println("WebSocket Watermill subscriber starting...")
// 	return router.Run(ctx)
// }

// func (s *WatermillSubscriber) Close() error {
// 	if s.router != nil {
// 		s.router.Close()
// 	}
// 	return nil
// }
