import { userApiClient } from "@/apiClient";
import WebSocketClient from "@/socket/WebSocketClient";
import { CallbackUsage } from "@/types/StateCallback";
import EventEmitter from "events";
import Loki, { Collection } from "lokijs";
const LokiIndexedAdapter = require('lokijs/src/loki-indexed-adapter');

const adapter = new LokiIndexedAdapter();

export const Application = new Loki('app.db', {
    adapter: adapter,
    autoload: true,
    autoloadCallback: () => {
        console.log('Database loaded from IndexedDB');
    },
    autosave: true,
    autosaveInterval: 1000,
});

type CachedCollectionCallback<T> = (data: T[], usage: CallbackUsage, regex?: string) => void;

export class CachedCollection<T extends { _id: string }, U = T> extends EventEmitter {
    public collection: Collection<T>;
    protected name: string;
    public eventName: string;
    protected updatedAt: Date = new Date(0);
    private callbacks: Set<{ cb: CachedCollectionCallback<T>; regex?: string }> = new Set();

    constructor(name: string) {
        super();
        this.name = name;
        this.eventName = `${name}-changed`
        this.collection = Application.addCollection<T>(name, { unique: ["_id"] });
    }

    pushCallback(callback: CachedCollectionCallback<T>, regex?: string): void {
        this.callbacks.add({ cb: callback, regex });
    }

    popCallback(callback: CachedCollectionCallback<T>): void {
        for (const item of this.callbacks) {
            if (item.cb === callback) {
                this.callbacks.delete(item);
                break;
            }
        }
    }

    processRecords(record: T[], usage: CallbackUsage) {
        this.callbacks.forEach(({ cb, regex }) => {
            cb(record, usage, regex);
        });
        this.emit(this.eventName, record);
    }

    async listen() {
        await this.init();
    }

    async init() {
        const cachedData = this.loadFromCache();
        if (!cachedData || cachedData.length === 0) {
            await this.loadFromServer();
        }
        return this.setupListener();
    }

    protected handleReceived(record: U, _action: 'removed' | 'changed'): T {
        return record as unknown as T;
    }

    protected async handleRecordEvent(action: 'removed' | 'changed', record: any) {
        const newRecord = this.handleReceived(record, action);

        if (!this.hasId(newRecord)) {
            console.warn("Received record without _id. Skipping...", record);
            return;
        }

        const { _id } = newRecord;

        if (action === 'removed') {
            this.collection.findAndRemove({ _id: { $eq: _id } });
            console.log(`Record removed: ${_id}`);
        } else {
            const recordToUpdate = this.collection.findOne({ _id: { $eq: _id } });
            if (recordToUpdate) {
                const updatedRecord = { ...recordToUpdate, ...newRecord, _id: recordToUpdate._id };
                this.collection.update(updatedRecord);
                console.log(`Record updated: ${_id}`);
            } else {
                console.log(`Insert new record with id: ${_id}`);
                this.collection.insert(newRecord);
            }
        }

        this.processRecords([record], CallbackUsage.ONE);
    }

    async setupListener() {
        if (!WebSocketClient.isConnected) {
            console.warn("WebSocket is not connected. Waiting for connection...");
            try {
                await WebSocketClient.waitForConnection();
                console.log("WebSocket connected, proceeding with subscription...");
            } catch (error) {
                console.error("WebSocket connection failed or timed out", error);
                return;
            }
        }

        const channel = `/topic/${this.eventName}`;

        WebSocketClient.subscribeToChannel(channel, async (message) => {
            try {
                const { action, record } = JSON.parse(message.body);
                console.log("Received WebSocket message:", action, record);
                await this.handleRecordEvent(action, record);
            } catch (error) {
                console.error("Error processing WebSocket message:", error);
            }
        });

        console.log(`Subscribed to WebSocket channel: ${channel}`);
    }

    loadFromCache(): T[] {
        return this.collection.find();
    }

    async loadFromServer() {
        try {
            const response = await userApiClient.get<T[]>(`${this.name}.get`);
            const startTime = new Date();
            const lastTime = this.updatedAt;

            response.forEach((record) => {
                const newRecord = this.handleLoadFromServer(record);
                if (!this.hasId(newRecord)) {
                    return;
                }

                const { _id } = newRecord;
                this.collection.findAndRemove({ _id: { $eq: _id } });
                this.collection.insert(newRecord);

                if (this.hasUpdatedAt(newRecord) && newRecord._updatedAt! > this.updatedAt) {
                    this.updatedAt = newRecord._updatedAt!;
                }
            });
            this.processRecords(response, CallbackUsage.MANY);

            this.updatedAt = this.updatedAt.getTime() === lastTime.getTime() ? startTime : this.updatedAt;
        } catch (error) {
            console.error("Ошибка при загрузке данных с сервера:", error);
        }
    }

    private handleLoadFromServer(record: T): T {
        return record;
    }

    private hasId = <T>(record: T): record is T & { _id: string } => typeof record === 'object' && record !== null && '_id' in record;
    private hasUpdatedAt = <T>(record: T): record is T & { _updatedAt: Date } =>
        typeof record === 'object' &&
        record !== null &&
        '_updatedAt' in record &&
        (record as unknown as { _updatedAt: unknown })._updatedAt instanceof Date;
}
