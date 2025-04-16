"use client";
import { memo, ReactNode } from "react";
import { SettingType, SettingValue } from "@/types/Setting";
import { UpdatableSetting } from "@/hooks/useSettings";
import { SettingWrapperContainer } from "./SettingWrapperContainer";
import { SettingWrapperBody } from "./SettingWrapperBody";

export interface SettingWrapperProps {
    setting: SettingValue;
    handleSave: (setting: UpdatableSetting) => void;
    debounceTime?: number;
    withWrapper?: boolean;
    validateError?: string;
    className?: string;
    headerChildren?: ReactNode;
    disabled?: boolean;
}

export const SettingWrapper = memo(({
    setting, handleSave, className,
    debounceTime = 1000, withWrapper = true,
    validateError, disabled
}: SettingWrapperProps) => {
    return (
        <SettingWrapperContainer
            i18nLabel={setting.type !== SettingType.Radio ? setting.i18nLabel : undefined}
            i18nDescription={setting.i18nDescription}
            withWrapper={withWrapper}
            validateError={validateError}
            className={className}
        >
            <SettingWrapperBody
                setting={setting}
                disabled={disabled}
                handleSave={handleSave}
                debounceTime={debounceTime}
                withWrapper={withWrapper}
            />
        </SettingWrapperContainer>
    );
}, (prevProps, nextProps) =>
    JSON.stringify(prevProps.setting.value) === JSON.stringify(nextProps.setting.value) &&
    prevProps.setting._id === nextProps.setting._id &&
    prevProps.validateError === nextProps.validateError
);