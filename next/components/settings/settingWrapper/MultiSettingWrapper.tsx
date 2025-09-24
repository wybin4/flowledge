"use client";
import { memo, useEffect, useState } from "react";
import { ComplexSettingValueType, SettingOption, SettingType, SettingValue } from "@/types/Setting";
import { SettingWrapperContainer } from "./SettingWrapperContainer";
import styles from "./SettingWrapper.module.css";
import { SettingWrapperProps } from "./SettingWrapper";
import { UpdatableSetting } from "@/hooks/useSettings";
import { areSettingWrapperContainerPropsEqual } from "./areSettingWrapperPropsEqual";
import { MultiSettingWrapperBodyRenderer } from "./MultiSettingWrapperBodyRenderer";

export type MultiSettingWrapperPlaceholder = (type: SettingType) => string;
export type MultiSettingWrapperAdditionalPropsLabel = (val: number) => string | undefined;
export type MultiSettingWrapperAdditionalProps = {
    options?: SettingOption[];
    disable?: (setting: SettingValue) => boolean;
    placeholder?: MultiSettingWrapperPlaceholder;
    label?: MultiSettingWrapperAdditionalPropsLabel;
    prefix?: string;
    selectedKey?: string;
    withWrapper?: boolean;
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
    setting, types, additionalProps,
    handleSave, className,
    debounceTime = 1000,
    validateError
}: MultiSettingWrapperProps) => {
    const [settingProps, setSettingProps] = useState<MultiSettingWrapperSetting>(setting);
    const hasHeaderChildren = !!types.filter(type => type === SettingType.Radio).length;

    useEffect(() => {
        setSettingProps(sp => ({ ...sp, value: setting.value }));
    }, [JSON.stringify(setting.value)]);

    const multiHandleSave = (
        newValue: UpdatableSetting,
        labeled?: string
    ) => {
        if (labeled) {
            const updatedSetting = {
                ...newValue,
                value: {
                    ...settingProps.value,
                    [labeled]: newValue.value,
                }
            } as UpdatableSetting;
            setSettingProps(prev => ({
                ...prev,
                value: {
                    ...prev.value,
                    [labeled]: newValue.value,
                } as ComplexSettingValueType
            }));
            handleSave(updatedSetting);
        }
    };

    return (
        <SettingWrapperContainer
            i18nLabel={settingProps.i18nLabel}
            i18nDescription={settingProps.i18nDescription}
            validateError={validateError}
            className={className}
            headerChildren={
                hasHeaderChildren && types
                    .map((type, index) => (
                        <MultiSettingWrapperBodyRenderer
                            key={index}
                            type={type}
                            index={index}
                            body={false}
                            settingProps={settingProps}
                            additionalProps={additionalProps}
                            debounceTime={debounceTime}
                            multiHandleSave={multiHandleSave}
                        />))
                    .filter(i => !!i)
            }
        >
            <div className={styles.multiContainer}>
                {types
                    .map((type, index) => (
                        <MultiSettingWrapperBodyRenderer
                            key={index}
                            type={type}
                            index={index}
                            body={true}
                            settingProps={settingProps}
                            additionalProps={additionalProps}
                            debounceTime={debounceTime}
                            multiHandleSave={multiHandleSave}
                        />))
                    .filter(i => !!i)
                }
            </div>
        </SettingWrapperContainer>
    );
}, (prevProps, nextProps) =>
    JSON.stringify(prevProps.types) === JSON.stringify(nextProps.types) &&
    JSON.stringify(prevProps.setting.value) === JSON.stringify(nextProps.setting.value) &&
    prevProps.setting.id === nextProps.setting.id &&
    (areSettingWrapperContainerPropsEqual as any)(prevProps, nextProps)
);