package websocket

// import (
// 	"log"
// 	"sync"
// )

// type Hub struct {
// 	clients map[*Client]bool
// 	mu      sync.Mutex
// }

// func NewHub() *Hub {
// 	return &Hub{
// 		clients: make(map[*Client]bool),
// 	}
// }

// func (h *Hub) Register(c *Client) {
// 	h.mu.Lock()
// 	defer h.mu.Unlock()
// 	h.clients[c] = true
// 	log.Printf("Client registered. Total clients: %d", len(h.clients))
// }

// func (h *Hub) Unregister(c *Client) {
// 	h.mu.Lock()
// 	defer h.mu.Unlock()
// 	delete(h.clients, c)
// 	log.Printf("Client unregistered. Total clients: %d", len(h.clients))
// }

// func (h *Hub) Broadcast(message interface{}) {
// 	h.mu.Lock()
// 	defer h.mu.Unlock()

// 	log.Printf("Broadcasting message to %d clients: %v", len(h.clients), message)

// 	for c := range h.clients {
// 		c.Send(message)
// 	}
// }
