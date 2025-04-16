"use client";
import { memo } from "react";
import { ComplexSettingValueType, SettingOption, SettingType, SettingValue, SettingValueType } from "@/types/Setting";
import { SettingWrapperContainer } from "./SettingWrapperContainer";
import { SettingWrapperBody } from "./SettingWrapperBody";
import styles from "./SettingWrapper.module.css";
import { SettingWrapperProps } from "./SettingWrapper";
import { UpdatableSetting } from "@/hooks/useSettings";

export type MultiSettingWrapperPlaceholder = (type: SettingType) => string;
export type MultiSettingWrapperAdditionalPropsLabel = (val: number) => string | undefined;
export type MultiSettingWrapperAdditionalProps = {
    options?: SettingOption[];
    disable?: (setting: SettingValue) => boolean;
    placeholder?: MultiSettingWrapperPlaceholder;
    label?: MultiSettingWrapperAdditionalPropsLabel;
};
export interface MultiSettingWrapperSetting extends Omit<SettingValue, 'type'> {
    value: ComplexSettingValueType;
    packageValue: ComplexSettingValueType;
};

export interface MultiSettingWrapperProps extends Omit<SettingWrapperProps, 'setting'> {
    setting: MultiSettingWrapperSetting;
    types: SettingType[];
    additionalProps?: MultiSettingWrapperAdditionalProps;
}

export const MultiSettingWrapper = memo(({
    setting: settingProps, types, additionalProps,
    handleSave, className,
    debounceTime = 1000,
    validateError
}: MultiSettingWrapperProps) => {
    const multiHandleSave = (
        newValue: UpdatableSetting,
        labeled?: string
    ) => {
        if (labeled) {
            const updatedSetting = {
                id: newValue.id,
                value: {
                    ...settingProps.value,
                    [labeled]: newValue.value,
                }
            };
            handleSave(updatedSetting);
        }
    };

    const renderSettingWrapperBody = (type: SettingType, index: number, body: boolean) => {
        const { placeholder, disable, label, ...rest } = additionalProps || {};
        const isRadio = type === SettingType.Radio;
        const setting = {
            ...settingProps, type,
            [isRadio ? 'i18nLabel' : 'placeholder']: placeholder?.(type),
            ...rest
        };

        if ((body && type === SettingType.Radio) || (!body && type !== SettingType.Radio)) {
            return null;
        }

        const labeled = label?.(index) || '';
        
        return (
            <SettingWrapperBody
                key={index}
                debounceTime={debounceTime}
                withWrapper={false}
                setting={{
                    ...setting, type,
                    value: settingProps.value[labeled],
                    packageValue: settingProps.packageValue[labeled],
                    [isRadio ? 'i18nLabel' : 'placeholder']: placeholder?.(type),
                    ...rest
                }}
                handleSave={(newValue) => multiHandleSave(newValue, labeled)}
                disabled={disable?.(setting)}
            />
        );
    };

    return (
        <SettingWrapperContainer
            i18nLabel={settingProps.i18nLabel}
            i18nDescription={settingProps.i18nDescription}
            validateError={validateError}
            className={className}
            headerChildren={
                types.map((type, index) => renderSettingWrapperBody(type, index, false)).filter(i => !!i)
            }
        >
            <div className={styles.multiContainer}>
                {types.map((type, index) => renderSettingWrapperBody(type, index, true)).filter(i => !!i)}
            </div>
        </SettingWrapperContainer>
    );
}, (prevProps, nextProps) =>
    JSON.stringify(prevProps.types) === JSON.stringify(nextProps.types) &&
    JSON.stringify(prevProps.setting.value) === JSON.stringify(nextProps.setting.value) &&
    prevProps.setting._id === nextProps.setting._id &&
    prevProps.validateError === nextProps.validateError
);