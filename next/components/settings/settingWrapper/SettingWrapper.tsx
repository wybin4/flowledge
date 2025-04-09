"use client";
import { memo } from "react";
import { SettingSelector } from "../SettingSelector/SettingSelector";
import { SettingInput } from "../SettingInput/SettingInput";
import { useTranslation } from "react-i18next";
import styles from "./SettingWrapper.module.css";
import { SelectorSetting, SettingType, SettingValue, SettingValueType } from "@/types/Setting";
import { SettingRadio } from "../SettingRadio/SettingRadio";
import { SettingCode } from "../SettingCode/SettingCode";
import { UpdatableSetting } from "@/hooks/useSettings";

export type SettingWrapperProps = {
    setting: SettingValue;
    handleSave: (setting: UpdatableSetting) => void;
    debounceTime?: number;
    withWrapper?: boolean;
}

export const SettingWrapper = memo(({ setting, handleSave, debounceTime = 1000, withWrapper = true }: SettingWrapperProps) => {
    const { t } = useTranslation();

    return (
        <div>
            <h3>{setting.type !== SettingType.Radio && t(setting.i18nLabel)}</h3>
            {(() => {
                switch (setting.type) {
                    case SettingType.SelectorFinite:
                    case SettingType.SelectorInfinite:
                        return <SettingSelector handleSave={handleSave} setting={setting as SelectorSetting<SettingValueType>} />;
                    case SettingType.InputPassword:
                    case SettingType.InputText:
                    case SettingType.InputNumber:
                        return <SettingInput handleSave={handleSave} setting={setting} debounceTime={debounceTime} />;
                    case SettingType.Radio:
                        return <SettingRadio handleSave={handleSave} setting={setting} withWrapper={withWrapper} />
                    case SettingType.Code:
                        return <SettingCode handleSave={handleSave} setting={setting} />
                    default:
                        return null;
                }
            })()}
            {setting.i18nDescription && t(setting.i18nDescription) !== setting.i18nDescription && <p className={styles.description}>{t(setting.i18nDescription)}</p>}
        </div>
    );
}, (prevProps, nextProps) =>
    prevProps.setting.value === nextProps.setting.value &&
    prevProps.setting._id === nextProps.setting._id
);