import { Client, IMessage } from "@stomp/stompjs";

class WebSocketClient {
    private client: Client;
    public isConnected: boolean = false;
    private connectPromise: Promise<void>;
    private resolveConnect: () => void = () => { };

    constructor(brokerURL: string) {
        this.client = new Client({
            brokerURL,
            onConnect: this.onConnect,
            onDisconnect: this.onDisconnect,
            onStompError: this.onStompError,
        });

        this.connectPromise = new Promise((resolve) => {
            this.resolveConnect = resolve;
        });

        this.client.activate();
    }

    private onConnect = () => {
        this.isConnected = true;
        console.log("WebSocket connected");
        this.resolveConnect();
    };

    private onDisconnect = () => {
        this.isConnected = false;
        console.log("WebSocket disconnected");
    };

    private onStompError = (frame: any) => {
        console.error("STOMP error: ", frame);
    };

    public activate() {
        this.client.activate();
    }

    public deactivate() {
        if (this.client.connected) {
            this.client.deactivate();
        }
    }

    public subscribeToChannel(channel: string, callback: (message: IMessage) => void) {
        if (this.isConnected) {
            this.client.subscribe(channel, (message: IMessage) => {
                console.log("Received message on channel:", channel);
                console.log(message.body);
                callback(message);
            });
        } else {
            console.error("WebSocket is not connected. Unable to subscribe.");
        }
    }

    public unsubscribeFromChannel(channel: string) {
        if (this.isConnected) {
            this.client.unsubscribe(channel);
            console.log(`Unsubscribed from channel: ${channel}`);
        } else {
            console.error("WebSocket is not connected. Unable to unsubscribe.");
        }
    }

    public getConnectionStatus() {
        return this.isConnected;
    }

    // Метод, который будет ждать подключения
    public waitForConnection() {
        return this.connectPromise;
    }
}

const webSocketClient = new WebSocketClient("ws://localhost:8080/websocket");
export default webSocketClient;