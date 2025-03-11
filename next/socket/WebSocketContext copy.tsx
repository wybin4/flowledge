"use client";
import { createContext, useEffect, useState, useMemo, ReactNode } from "react";
import { Client, IMessage } from "@stomp/stompjs";

export interface WebSocketContextType {
    subscribeToChannel: (channel: string, callback: (message: IMessage) => void) => void;
    unsubscribeFromChannel: (channel: string) => void;
    isConnected: boolean; // Состояние подключения
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
    children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const [client, setClient] = useState<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false); // Флаг подключения

    useEffect(() => {
        const socketClient = new Client({
            brokerURL: "ws://localhost:8080/websocket",
            onConnect: () => {
                console.log("WebSocket connected");
                setIsConnected(true); // Устанавливаем флаг подключения
            },
            onDisconnect: () => {
                console.log("WebSocket disconnected");
                setIsConnected(false); // Сбрасываем флаг подключения
            },
            onStompError: (frame) => {
                console.error("STOMP error: ", frame);
            },
        });

        socketClient.activate();
        setClient(socketClient);

        return () => {
            if (socketClient.connected) {
                socketClient.deactivate();
            }
        };
    }, []);

    const subscribeToChannel = (channel: string, callback: (message: IMessage) => void) => {
        if (client && isConnected) {
            const subscription = client.subscribe(channel, (message: IMessage) => {
                console.log("Received message on channel:", channel);
                console.log(message.body);  // Логируем тело сообщения
                callback(message);
            });
        } else {
            console.error("WebSocket is not connected. Unable to subscribe.");
        }
    };

    const unsubscribeFromChannel = (channel: string) => {
        if (client && isConnected) {
            client.unsubscribe(channel);
            console.log(`Unsubscribed from channel: ${channel}`);
        } else {
            console.error("WebSocket is not connected. Unable to unsubscribe.");
        }
    };

    const value = useMemo(() => ({
        subscribeToChannel,
        unsubscribeFromChannel,
        isConnected, // передаем состояние подключения
    }), [client, isConnected]);

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};
