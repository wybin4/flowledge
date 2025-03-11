import { CallbackUsage, RemoveStateCallbacks, SetStateCallbacks } from "@/types/StateCallback";
import { SettingValue, SettingValueType } from "@/types/Setting";
import { notFound } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useStateUpdate } from "./useStateUpdate";

export type UpdatableSetting = {
    id: string, value: SettingValueType
};

type UseSettingsProps = {
    getSettings: (regex: string) => SettingValue[];
    setStateCallbacks: SetStateCallbacks<SettingValue>;
    removeStateCallbacks: RemoveStateCallbacks<SettingValue>;
    updateSettings: (setting: UpdatableSetting, setError: (error: string | null) => void) => Promise<void>;
    regex: string;
};

export function useSettings({
    getSettings,
    setStateCallbacks,
    removeStateCallbacks,
    updateSettings,
    regex,
}: UseSettingsProps) {
    const initialSettings = getSettings(regex);
    const [settings, setSettings] = useState<SettingValue[]>(initialSettings);
    const [error, setError] = useState<string | null>(null);

    useStateUpdate<SettingValue>(regex, setSettings, setStateCallbacks, removeStateCallbacks);

    const handleSave = async (setting: UpdatableSetting) => {
        try {
            await updateSettings(setting, setError);
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (!settings || settings.length === 0) {
        notFound();
    }

    return { settings, error, handleSave };
}
