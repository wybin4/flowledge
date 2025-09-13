package websocket

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type Client struct {
	conn *websocket.Conn
	hub  *Hub
}

func ServeWS(hub *Hub) http.HandlerFunc {
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}

	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Printf("WebSocket upgrade failed: %v", err)
			return
		}
		log.Println("WebSocket connection established")

		client := &Client{conn: conn, hub: hub}
		hub.Register(client)

		go client.readPump()
	}
}

func (c *Client) readPump() {
	defer func() {
		c.hub.Unregister(c)
		c.conn.Close()
	}()

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			log.Printf("WebSocket read error: %v", err)
			break
		}
		log.Printf("Received message from client: %s", string(message))
	}
}

func (c *Client) Send(message interface{}) {
	err := c.conn.WriteJSON(message)
	if err != nil {
		log.Printf("WebSocket send error: %v", err)
	} else {
		log.Printf("Message sent to client successfully")
	}
}
