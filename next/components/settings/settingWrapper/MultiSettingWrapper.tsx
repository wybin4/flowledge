"use client";
import { memo } from "react";
import { SettingOption, SettingType, SettingValue } from "@/types/Setting";
import { UpdatableSetting } from "@/hooks/useSettings";
import { SettingWrapperContainer } from "./SettingWrapperContainer";
import { SettingWrapperBody } from "./SettingWrapperBody";
import styles from "./SettingWrapper.module.css";
import { SettingWrapperProps } from "./SettingWrapper";

export type MultiSettingWrapperPlaceholder = (type: SettingType) => string;
export type MultiSettingWrapperAdditionalProps = {
    options?: SettingOption[];
    placeholder?: MultiSettingWrapperPlaceholder;
};
export type MultiSettingWrapperSetting = Omit<SettingValue, 'type'>;

export interface MultiSettingWrapperProps extends Omit<SettingWrapperProps, 'setting'> {
    setting: MultiSettingWrapperSetting;
    types: SettingType[];
    additionalProps?: MultiSettingWrapperAdditionalProps;
}

export const MultiSettingWrapper = memo(({
    setting, types, additionalProps,
    handleSave, className,
    debounceTime = 1000, withWrapper = true,
    validateError
}: MultiSettingWrapperProps) => {
    return (
        <SettingWrapperContainer
            i18nLabel={setting.i18nLabel}
            i18nDescription={setting.i18nDescription}
            validateError={validateError}
            className={className}
        >
            <div className={styles.multiContainer}>
                {types.map((type, index) => {
                    const { placeholder, ...rest } = additionalProps || {};
                    return (
                        <SettingWrapperBody
                            key={index}
                            debounceTime={debounceTime}
                            withWrapper={withWrapper}
                            setting={{
                                ...setting, type,
                                placeholder: placeholder?.(type),
                                ...rest
                            }}
                            handleSave={handleSave}
                        />
                    );
                })}
            </div>
        </SettingWrapperContainer>
    );
}, (prevProps, nextProps) =>
    prevProps.setting.value === nextProps.setting.value &&
    prevProps.setting._id === nextProps.setting._id &&
    prevProps.validateError === nextProps.validateError
);