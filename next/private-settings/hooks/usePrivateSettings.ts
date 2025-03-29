import { useCallback } from 'react';
import { UpdatableSetting, useSettings } from '@/hooks/useSettings';
import { getPrivateSettingsByRegex, PrivateSettings } from '@/collections/PrivateSettings';
import { userApiClient } from '@/apiClient';

export function usePrivateSettings(regex: string) {
    const updateSettings = useCallback(async (setting: UpdatableSetting, setError: (error: string | null) => void) => {
        try {
            await userApiClient({ url: 'settings.set', options: { method: 'POST', body: JSON.stringify(setting) } });
        } catch (err: any) {
            setError(err.message);
        }
    }, []);

    return useSettings({
        getSettings: (regex: string) => getPrivateSettingsByRegex([regex]),
        setStateCallbacks: PrivateSettings.pushCallback.bind(PrivateSettings),
        removeStateCallbacks: PrivateSettings.popCallback.bind(PrivateSettings),
        updateSettings: updateSettings,
        regex,
    });
}
