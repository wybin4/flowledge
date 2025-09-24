import { getPrivateSettingByRegex, PrivateSettings } from "@/collections/PrivateSettings";
import { useStateFromService } from "@/hooks/useStateFromService";
import { SettingValueType } from "@/types/Setting";
import { useEffect, useState } from "react";

export const usePrivateSetting = <T,>(id: string): T | undefined => {
    const getValue = () => getPrivateSettingByRegex<SettingValueType>([id]) as T;
    const [settingValue, setSettingValue] = useState<T | undefined>(getValue());

    useEffect(() => {
        setSettingValue(getValue());
    }, [id]);

    useStateFromService(
        getValue,
        PrivateSettings.eventName,
        PrivateSettings,
        (newState) => {
            if (Array.isArray(newState) && newState[0]?.value !== settingValue) {
                setSettingValue(newState[0].value as T);
            }
        }
    );

    return settingValue;
};
