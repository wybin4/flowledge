export class WebSocketClient {
    private socket: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectInterval = 3000;
    private isConnecting = false;
    private connectionPromise: Promise<void> | null = null;

    private messageCallbacks = new Map<string, ((data: any) => void)[]>();
    private onConnectCallback: (() => void) | null = null;
    private onDisconnectCallback: (() => void) | null = null;
    private onErrorCallback: ((error: Event) => void) | null = null;

    constructor(private url: string = "ws://localhost:8088/websocket") { }

    public connect(): Promise<void> {
        if (this.connectionPromise) return this.connectionPromise;
        if (this.socket?.readyState === WebSocket.OPEN) return Promise.resolve();
        if (this.isConnecting) return Promise.reject(new Error("Connection already in progress"));

        this.connectionPromise = new Promise((resolve, reject) => {
            this.isConnecting = true;

            const cleanup = () => {
                this.isConnecting = false;
                this.connectionPromise = null;
            };

            try {
                this.socket = new WebSocket(this.url);

                this.socket.onopen = (event) => {
                    cleanup();
                    this.reconnectAttempts = 0;
                    this.onConnectCallback?.();
                    resolve();
                };

                this.socket.onerror = (event) => {
                    cleanup();
                    this.onErrorCallback?.(event);
                    reject(new Error("WebSocket connection failed"));
                };

                this.socket.onclose = (event) => {
                    cleanup();
                    this.onDisconnectCallback?.();
                    if (event.code !== 1000) this.handleReconnection();
                };

                this.socket.onmessage = (event) => this.handleMessage(event);

                setTimeout(() => {
                    if (this.isConnecting) {
                        this.socket?.close(1000, "Connection timeout");
                        reject(new Error("Connection timeout"));
                    }
                }, 10000);

            } catch (error) {
                cleanup();
                reject(error);
            }
        });

        return this.connectionPromise;
    }

    private handleReconnection() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1);
            setTimeout(() => this.connect().catch(() => { }), delay);
        }
    }

    private handleMessage(event: MessageEvent) {
        try {
            const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            const callbacks = data.action ? this.messageCallbacks.get(data.action) || [] : [];
            callbacks.forEach(cb => cb(data));
            (this.messageCallbacks.get('*') || []).forEach(cb => cb(data));
        } catch {
            // игнорируем ошибки парсинга
        }
    }

    public async send(message: any) {
        if (!this.isConnected) await this.waitForConnection();
        this.socket?.readyState === WebSocket.OPEN && this.socket.send(JSON.stringify(message));
    }

    public subscribe(eventType: string, callback: (data: any) => void) {
        if (!this.messageCallbacks.has(eventType)) this.messageCallbacks.set(eventType, []);
        this.messageCallbacks.get(eventType)!.push(callback);
    }

    public unsubscribe(eventType: string, callback?: (data: any) => void) {
        if (callback) {
            const callbacks = this.messageCallbacks.get(eventType);
            if (callbacks) {
                const idx = callbacks.indexOf(callback);
                if (idx > -1) callbacks.splice(idx, 1);
            }
        } else {
            this.messageCallbacks.delete(eventType);
        }
    }

    public onConnect(cb: () => void) { this.onConnectCallback = cb; }
    public onDisconnect(cb: () => void) { this.onDisconnectCallback = cb; }
    public onError(cb: (err: Event) => void) { this.onErrorCallback = cb; }

    public disconnect() {
        this.socket?.close(1000, "Client disconnected");
        this.socket = null;
        this.reconnectAttempts = this.maxReconnectAttempts;
    }

    public get isConnected() { return this.socket?.readyState === WebSocket.OPEN; }

    public waitForConnection(): Promise<void> {
        if (this.isConnected) return Promise.resolve();
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50;
            const check = () => {
                if (this.isConnected) resolve();
                else if (attempts++ >= maxAttempts) reject(new Error("Connection timeout"));
                else setTimeout(check, 100);
            };
            check();
        });
    }
}

const webSocketClient = new WebSocketClient();
export default webSocketClient;
export async function initializeWebSocket() { await webSocketClient.connect(); }