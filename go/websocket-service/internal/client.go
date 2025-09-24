package websocket

import (
	"encoding/json"
	"time"

	"github.com/gorilla/websocket"
)

type Client struct {
	conn      *websocket.Conn
	hub       *Hub
	send      chan []byte
	subscribe map[string]bool
}

func (c *Client) readPump() {
	defer func() { c.hub.unregister <- c; c.conn.Close() }()
	for {
		_, msg, err := c.conn.ReadMessage()
		if err != nil {
			break
		}

		var command struct {
			Action string `json:"action"`
			Topic  string `json:"topic"`
		}
		if err := json.Unmarshal(msg, &command); err != nil {
			continue
		}

		switch command.Action {
		case "subscribe":
			c.Subscribe(command.Topic)
		case "unsubscribe":
			c.Unsubscribe(command.Topic)
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

func (c *Client) Subscribe(topic string) {
	if c.subscribe == nil {
		c.subscribe = make(map[string]bool)
	}
	c.subscribe[topic] = true
}

func (c *Client) Unsubscribe(topic string) {
	delete(c.subscribe, topic)
}
