import { memo } from "react";
import { SettingWrapperProps } from "./settingWrapper/SettingWrapper";
import { InputBox } from "@/components/inputBox/InputBox";
import { InputBoxWrapper } from "@/components/inputBox/InputBoxWrapper";
import { ToggleSwitch } from "@/components/toggleSwitch/ToggleSwitch";

export const SettingRadio = memo(({ setting }: SettingWrapperProps) => {

    return (
        <InputBoxWrapper>
            <InputBox name={setting.name} style={{ cursor: 'default' }}><ToggleSwitch /></InputBox>
        </InputBoxWrapper>
    );
});