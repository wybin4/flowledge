"use client";
import { SettingWrapperBody } from "./SettingWrapperBody";
import { SettingType, SettingValue } from "@/types/Setting";
import { UpdatableSetting } from "@/hooks/useSettings";
import { useEffect, useState } from "react";

interface MultiSettingWrapperBodyRendererProps {
    type: SettingType;
    index: number;
    body: boolean;
    settingProps: any;
    additionalProps?: {
        placeholder?: (type: SettingType) => string;
        disable?: (setting: SettingValue) => boolean;
        label?: (val: number) => string | undefined;
    };
    debounceTime?: number;
    multiHandleSave: (newValue: UpdatableSetting, labeled?: string) => void;
}

export const MultiSettingWrapperBodyRenderer = ({
    type, index, body, settingProps, additionalProps, debounceTime = 1000, multiHandleSave
}: MultiSettingWrapperBodyRendererProps) => {
    const { placeholder, disable, label, ...rest } = additionalProps || {};
    const isRadio = type === SettingType.Radio;

    const [setting, setSetting] = useState({
        ...settingProps, type,
        [isRadio ? 'i18nLabel' : 'placeholder']: placeholder?.(type),
        ...rest
    });

    const [labeled, setLabeled] = useState<string>('');
    const [disabled, setDisabled] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        const newSetting = {
            ...settingProps, type,
            [isRadio ? 'i18nLabel' : 'placeholder']: placeholder?.(type),
            ...rest
        };
        setSetting(newSetting);
        setLabeled(label?.(index) || '');
        setDisabled(disable?.(newSetting));
    }, [JSON.stringify(settingProps), JSON.stringify(setting), type, placeholder, label, disable, index, isRadio, JSON.stringify(rest)]);


    if ((body && type === SettingType.Radio) || (!body && type !== SettingType.Radio)) {
        return null;
    }

    return (
        <SettingWrapperBody
            key={index}
            debounceTime={debounceTime}
            withWrapper={false}
            setting={{
                ...setting, type,
                value: settingProps.value[labeled] || '',
                packageValue: settingProps.packageValue[labeled],
                [isRadio ? 'i18nLabel' : 'placeholder']: placeholder?.(type),
                ...rest
            }}
            handleSave={(newValue) => multiHandleSave(newValue, labeled)}
            disabled={disabled}
        />
    );
};