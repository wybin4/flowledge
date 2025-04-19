"use client";
import { memo } from "react";
import { SettingSelector } from "../SettingSelector/SettingSelector";
import { SettingInput } from "../SettingInput/SettingInput";
import { SelectorSetting, SettingType, SimpleSettingValueType } from "@/types/Setting";
import { SettingRadio } from "../SettingRadio/SettingRadio";
import { SettingCode } from "../SettingCode/SettingCode";
import { SettingWrapperProps } from "./SettingWrapper";
import { areSettingWrapperPropsEqual } from "./areSettingWrapperPropsEqual";

export interface SettingWrapperBodyProps extends Omit<SettingWrapperProps, 'validateError' | 'className'> { }

export const SettingWrapperBody = memo(({
    setting, handleSave, disabled,
    debounceTime = 1000, withWrapper = true,
}: SettingWrapperBodyProps) => {
    switch (setting.type) {
        case SettingType.SelectorFinite:
        case SettingType.SelectorInfinite:
            return (
                <SettingSelector
                    handleSave={handleSave}
                    setting={setting as SelectorSetting<SimpleSettingValueType>}
                    disabled={disabled}
                />
            );
        case SettingType.InputPassword:
        case SettingType.InputText:
        case SettingType.InputNumber:
            return (
                <SettingInput
                    handleSave={handleSave}
                    setting={setting}
                    debounceTime={debounceTime}
                    disabled={disabled}
                />
            );
        case SettingType.Radio:
            return <SettingRadio handleSave={handleSave} setting={setting} withWrapper={withWrapper} />;
        case SettingType.Code:
            return <SettingCode handleSave={handleSave} setting={setting} />;
        default:
            return null;
    }
}, areSettingWrapperPropsEqual);