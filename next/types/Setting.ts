import { JSX } from "react";

export type SettingOption = {
    label: string;
    value: SettingValueType;
};

export enum SettingType {
    SelectorFinite = "SELECTOR_FINITE",
    SelectorInfinite = "SELECTOR_INFINITE",
    InputText = "INPUT_TEXT",
    InputNumber = "INPUT_NUMBER",
    InputPassword = "INPUT_PASSWORD",
    Radio = "Radio",
    Code = "Code",
}

type BaseSetting<T> = {
    _id: string;
    type: SettingType;
    i18nLabel: string;
    i18nDescription?: string;
    value: T;
    packageValue: T;
};

export type SelectorSetting<T> = BaseSetting<T> & {
    type: SettingType.SelectorFinite | SettingType.SelectorInfinite;
    options: SettingOption[];
    placeholder?: string;
};

export type InputTextSetting<T> = BaseSetting<T> & {
    type: SettingType.InputText;
    placeholder?: string;
};

export type InputNumberSetting<T> = BaseSetting<T> & {
    type: SettingType.InputNumber;
    min?: number;
    max?: number;
};

export type Setting<T> = SelectorSetting<T> | InputTextSetting<T> | InputNumberSetting<T> | BaseSetting<T>;
export type SettingValueType = string | number | boolean;
export type SettingValue = Setting<SettingValueType>;

export type SettingsTab = {
    name: string;
    label: string;
    settings: SettingValue[];
};

export type Tab = Omit<SettingsTab, 'settings'>;