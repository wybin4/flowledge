import { getPrivateSettingsByRegex } from "@/collections/PrivateSettings";
import WebSocketClient from "../socket/WebSocketClient";
import { userApiClient } from "@/apiClient";
import EventEmitter from "events";
import { User } from "./types/User";
import { UserSetting } from "./types/UserSetting";
import { UpdatableSetting } from "@/hooks/useSettings";
import { SettingValue } from "@/types/Setting";

export type UserSettings = SettingValue[];
type UserSettingsCallback = (settings: UserSettings, regex?: string) => void;

class UserService extends EventEmitter {
    public userId: string;
    private userState: User | undefined = undefined;
    private userStateCallbacks: Set<{ cb: UserSettingsCallback; regex?: string }> = new Set();
    public eventName = 'user-changed';

    constructor(userId: string) {
        super();
        this.userId = userId;
    }

    async fetchUser() {
        const user = await userApiClient<User>({ url: `users.get?id=${this.userId}` });
        this.setUserState(user);
    }

    setUserState(data: User) {
        this.userState = data;
        this.userStateCallbacks.forEach(({ cb, regex }) => {
            cb(this.processUserSettings(data.settings, regex), regex);
        });
        this.emit(this.eventName, data);
    }

    setUserStateCallbacks(callback: UserSettingsCallback, regex?: string) {
        this.userStateCallbacks.add({ cb: callback, regex });
    }

    removeUserStateCallbacks(callback: UserSettingsCallback) {
        this.userStateCallbacks.forEach(({ cb, regex }) => {
            if (cb === callback) {
                this.userStateCallbacks.delete({ cb, regex });
            }
        });
    }

    subscribeToUserChanges() {
        const channel = `/topic/${this.userId}/${this.eventName}`;

        WebSocketClient.subscribeToChannel(channel, (message) => {
            console.log("Received user change message:", message.body);
            const { record } = JSON.parse(message.body);
            this.setUserState(record);
            console.log("Updated user state:", this.userState);
        });
    }

    async updateUserSetting(setting: UpdatableSetting): Promise<void> {
        try {
            await userApiClient({
                url: `users.set-setting?userId=${this.userId}`,
                options: {
                    method: 'POST', body: JSON.stringify(setting)
                }
            });
        } catch (error: any) {
            return error.message;
        }
    }

    getUserState() {
        return this.userState;
    }

    useUserSettings(regex?: string) {
        return this.processUserSettings(this.userState?.settings ?? {}, regex);
    }

    private processUserSettings(settings: UserSetting, regex?: string): SettingValue[] {
        if (settings) {
            const regexArray: string[] = [this.getUserSettingRegex()];

            if (regex && regex !== '') {
                regexArray.push(regex);
            }

            const defaultSettings = getPrivateSettingsByRegex(regexArray);

            defaultSettings.forEach((defaultSetting: SettingValue, idx) => {
                const key = defaultSetting._id.split('.').pop() || '';
                const settingValue = settings[key as keyof UserSetting];
                if (settingValue) {
                    defaultSettings[idx] = {
                        ...defaultSettings[idx],
                        value: settingValue
                    };
                }
            });

            return defaultSettings;
        } else {
            console.error("User state or settings not available.");
        }

        return [];
    }

    getUserSettingRegex(): string {
        return 'user-default';
    }
}

const userService = new UserService("ce7f53dd-caf7-4b4e-a83a-3a19ffd91bed");
export default userService;
