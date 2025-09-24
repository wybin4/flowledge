export type SettingOption = {
    label: string;
    value: SettingValueType;
};

export enum SettingType {
    SelectorFinite = "SELECTOR_FINITE",
    SelectorInfinite = "SELECTOR_INFINITE",
    SelectorInfiniteMultiple = "SELECTOR_INFINITE_MULTIPLE",
    InputText = "INPUT_TEXT",
    TextArea = "TEXTAREA",
    InputNumber = "INPUT_NUMBER",
    InputImage = "INPUT_IMAGE",
    InputPassword = "INPUT_PASSWORD",
    Radio = "RADIO",
    Code = "CODE",
}

type BaseSetting<T> = {
    id: string;
    type: SettingType;
    i18nLabel: string;
    i18nDescription?: string;
    value: T;
    packageValue: T;
    placeholder?: string;
};

export type SelectorSetting<T> = BaseSetting<T> & {
    type: SettingType.SelectorFinite | SettingType.SelectorInfinite | SettingType.SelectorInfiniteMultiple;
    options: SettingOption[];
    prefix?: string;
    selectedKey?: string;
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
export type SimpleSettingValueType = string | number | boolean;
export type ComplexSettingValueType = Record<string, SimpleSettingValueType>;
export type SettingValueType = SimpleSettingValueType | ComplexSettingValueType;
export type SettingValue = Setting<SettingValueType>;

export type SettingsTab = {
    name: string;
    label: string;
    settings: SettingValue[];
};

export type Tab = Omit<SettingsTab, 'settings'>;