import { getPrivateSettingByRegex } from "@/collections/PrivateSettings";
import UserService from "@/user/UserService";
import { useCallback, useEffect, useState } from "react";
import { User } from "../types/User";
import { UserSetting } from "../types/UserSetting";

export const useUserSetting = <T,>(_id: keyof UserSetting): T | undefined => {
    const [settingValue, setSettingValue] = useState<T | undefined>(undefined);

    function updateSettingValue<T>(state: User | undefined) {
        if (!state) {
            return;
        }

        const defaultSettingValue = getPrivateSettingByRegex<T>([UserService.getUserSettingRegex(), _id]);
        const newUserSettingValue = state.settings[_id] as T | undefined;

        setSettingValue(newUserSettingValue || defaultSettingValue as any);
    }

    const handleUserStateChange = useCallback(
        (newState: User | undefined) => updateSettingValue(newState), [_id]
    );

    useEffect(() => {
        updateSettingValue(UserService.getUserState());

        UserService.on('userStateChanged', handleUserStateChange);

        return () => {
            UserService.off('userStateChanged', handleUserStateChange);
        };
    }, [_id, handleUserStateChange]);

    return settingValue;
};
