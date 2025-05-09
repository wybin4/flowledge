"use client";
import { memo } from "react";
import { SettingSelector } from "../SettingSelector/SettingSelector";
import { SettingInput } from "../SettingInput/SettingInput";
import { SettingType } from "@/types/Setting";
import { SettingRadio } from "../SettingRadio/SettingRadio";
import { SettingCode } from "../SettingCode/SettingCode";
import { SettingWrapperProps } from "./SettingWrapper";
import { areSettingWrapperPropsEqual } from "./areSettingWrapperPropsEqual";
import { SettingTextArea } from "../SettingTextArea/SettingTextArea";

export interface SettingWrapperBodyProps extends Omit<SettingWrapperProps, 'validateError' | 'className'> { }

export const SettingWrapperBody = memo(({
    setting, handleSave, disabled,
    debounceTime = 1000, withWrapper = true,
    isOptionsTranslatable,
}: SettingWrapperBodyProps) => {
    switch (setting.type) {
        case SettingType.SelectorFinite:
        case SettingType.SelectorInfinite:
        case SettingType.SelectorInfiniteMultiple:
            return (
                <SettingSelector
                    handleSave={handleSave}
                    setting={setting as any}
                    disabled={disabled}
                    isOptionsTranslatable={isOptionsTranslatable}
                />
            );
        case SettingType.TextArea:
            return (
                <SettingTextArea
                    handleSave={handleSave}
                    setting={setting}
                    debounceTime={debounceTime}
                />
            )
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
            return (
                <SettingRadio
                    handleSave={handleSave}
                    setting={setting}
                    withWrapper={withWrapper}
                    disabled={disabled}
                />
            );
        case SettingType.Code:
            return (
                <SettingCode
                    handleSave={handleSave}
                    setting={setting}
                    disabled={disabled}
                />
            );
        default:
            return null;
    }
}, areSettingWrapperPropsEqual);