package websocket

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/gorilla/websocket"
)

// --- CLIENT & HUB ---

type Client struct {
	conn      *websocket.Conn
	hub       *Hub
	send      chan []byte
	subscribe map[string]bool
}

type Hub struct {
	clients    map[*Client]bool
	register   chan *Client
	unregister chan *Client
	mu         sync.Mutex
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
			h.mu.Unlock()
		}
	}
}

func (c *Client) Subscribe(topic string) {
	if c.subscribe == nil {
		c.subscribe = make(map[string]bool)
	}
	c.subscribe[topic] = true
}

func (c *Client) Unsubscribe(topic string) {
	delete(c.subscribe, topic)
}

func (h *Hub) Broadcast(topic string, message interface{}) {
	data, err := json.Marshal(message)
	if err != nil {
		return
	}
	h.mu.Lock()
	defer h.mu.Unlock()
	for client := range h.clients {
		if client.subscribe[topic] {
			select {
			case client.send <- data:
			default:
				close(client.send)
				delete(h.clients, client)
			}
		}
	}
}

func ServeWS(hub *Hub) http.HandlerFunc {
	upgrader := websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}
	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			return
		}
		client := &Client{conn: conn, hub: hub, send: make(chan []byte, 256)}
		hub.register <- client
		go client.writePump()
		go client.readPump()
	}
}

func (c *Client) readPump() {
	defer func() { c.hub.unregister <- c; c.conn.Close() }()
	for {
		if _, _, err := c.conn.ReadMessage(); err != nil {
			break
		}
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(30 * time.Second)
	defer func() { ticker.Stop(); c.conn.Close() }()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// --- WATERMILL SUBSCRIBER ---

type WatermillSubscriber struct {
	hub            *Hub
	userSubscriber message.Subscriber
	setSubscriber  message.Subscriber
}

func NewWatermillSubscriber(hub *Hub, userSub, settingSub message.Subscriber) *WatermillSubscriber {
	return &WatermillSubscriber{
		hub:            hub,
		userSubscriber: userSub,
		setSubscriber:  settingSub,
	}
}

func (s *WatermillSubscriber) Start(ctx context.Context) error {
	go s.listenUserEvents(ctx)
	go s.listenSettingEvents(ctx)
	<-ctx.Done()
	return nil
}

func (s *WatermillSubscriber) listenUserEvents(ctx context.Context) {
	messages, err := s.userSubscriber.Subscribe(ctx, "user-events")
	if err != nil {
		log.Printf("Failed to subscribe user-events: %v", err)
		return
	}
	for msg := range messages {
		var event map[string]interface{}
		if err := json.Unmarshal(msg.Payload, &event); err == nil {
			s.hub.Broadcast("/topic/user-changed", event)
		}
		msg.Ack()
	}
}

func (s *WatermillSubscriber) listenSettingEvents(ctx context.Context) {
	messages, err := s.setSubscriber.Subscribe(ctx, "setting-events")
	if err != nil {
		log.Printf("Failed to subscribe setting-events: %v", err)
		return
	}
	for msg := range messages {
		var event map[string]interface{}
		if err := json.Unmarshal(msg.Payload, &event); err == nil {
			s.hub.Broadcast("/topic/private-settings-changed", event)
		}
		msg.Ack()
	}
}
