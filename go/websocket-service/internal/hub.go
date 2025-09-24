package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Hub struct {
	clients    map[*Client]bool
	register   chan *Client
	unregister chan *Client
	mu         sync.Mutex
	shutdown   chan struct{}
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		shutdown:   make(chan struct{}),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			log.Printf("Client registered. Total clients: %d", len(h.clients))
		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				log.Printf("Client unregistered. Total clients: %d", len(h.clients))
			}
			h.mu.Unlock()
		case <-h.shutdown:
			h.mu.Lock()
			for client := range h.clients {
				close(client.send)
				client.conn.Close()
			}
			h.clients = make(map[*Client]bool)
			h.mu.Unlock()
			log.Println("Hub shutdown completed")
			return
		}
	}
}

func (h *Hub) Shutdown() {
	log.Println("Shutting down hub...")
	close(h.shutdown)
}

type WSMessage struct {
	Topic   string      `json:"topic"`
	Payload interface{} `json:"payload"`
	Time    time.Time   `json:"time"`
}

func (h *Hub) Broadcast(topic string, message interface{}) {
	wsMessage := WSMessage{
		Topic:   topic,
		Payload: message,
		Time:    time.Now(),
	}

	data, err := json.Marshal(wsMessage)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	log.Printf("Broadcasting to topic %s, %d clients connected", topic, len(h.clients))
	for client := range h.clients {
		if client.subscribe[topic] {
			select {
			case client.send <- data:
			default:
				close(client.send)
				delete(h.clients, client)
				client.conn.Close()
			}
		}
	}
}

func ServeWS(hub *Hub) http.HandlerFunc {
	upgrader := websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}
	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Printf("WebSocket upgrade error: %v", err)
			return
		}
		client := &Client{conn: conn, hub: hub, send: make(chan []byte, 256), subscribe: make(map[string]bool)}
		hub.register <- client
		go client.writePump()
		go client.readPump()
		log.Printf("New WebSocket client connected: %s", conn.RemoteAddr())
	}
}
