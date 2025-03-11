import { getPrivateSettingByRegex } from "@/collections/PrivateSettings";
import UserService from "@/user/UserService";
import { useCallback, useState } from "react";
import { User } from "../types/User";
import { UserSetting } from "../types/UserSetting";
import { useStateFromService } from "@/hooks/useStateFromService";

export const useUserSetting = <T,>(_id: keyof UserSetting): T | undefined => {
    const [settingValue, setSettingValue] = useState<T | undefined>(UserService.getUserState()?.settings[_id] as T);

    const updateSettingValue = useCallback(
        (newState: User | undefined) => {
            if (!newState) {
                return;
            }

            const defaultSettingValue = getPrivateSettingByRegex<T>([
                UserService.getUserSettingRegex(),
                _id,
            ]);

            const newUserSettingValue = newState.settings[_id] as T | undefined;

            setSettingValue(newUserSettingValue || defaultSettingValue);
        },
        [_id]
    );

    useStateFromService<User | undefined>(
        () => UserService.getUserState(),
        UserService.eventName,
        UserService,
        updateSettingValue
    );

    return settingValue;
};
