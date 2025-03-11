import UserService from "../UserService";
import { UpdatableSetting, useSettings } from "../../hooks/useSettings";
import { useCallback } from "react";

export function useUserSettings(regex: string) {
    const updateSettings = useCallback(async (
        setting: UpdatableSetting,
        setError: (error: string | null) => void
    ) => {
        try {
            const key = setting.id.split('.').pop() || '';
            setting.id = key;
            await UserService.updateUserSetting(setting as any);
        } catch (err: any) {
            setError(err.message);
        }
    }, []);

    return useSettings({
        getSettings: UserService.useUserSettings.bind(UserService),
        setStateCallbacks: UserService.setUserStateCallbacks.bind(UserService),
        removeStateCallbacks: UserService.removeUserStateCallbacks.bind(UserService),
        updateSettings: updateSettings,
        regex,
    });
}
