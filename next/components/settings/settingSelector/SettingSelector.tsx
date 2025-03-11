import { memo } from "react";
import styles from "./SettingSelector.module.css";
import cn from 'classnames';
import SelectorInfiniteIcon from "../../../assets/selector-infinite.svg";
import { SelectorSetting, SettingValueType, SettingType, SettingOption, Setting } from "@/types/Setting";
import { useTranslation } from "react-i18next";
import { InputBox } from "@/components/inputBox/InputBox";
import { InputBoxWrapper } from "@/components/inputBox/InputBoxWrapper";
import { UpdatableSetting } from "@/hooks/useSettings";

type SettingSelectorProps = {
    setting: SelectorSetting<SettingValueType>;
    handleSave: (setting: UpdatableSetting) => void;
}

export const SettingSelector = memo(({ setting, handleSave }: SettingSelectorProps) => {
    const { t } = useTranslation();
    
    return (
        <InputBoxWrapper>
            {setting.type === SettingType.SelectorFinite ? (
                setting.options.map(option => (
                    <div
                        key={option.label}
                        className={cn(styles.finiteItem, {
                            [styles.finiteActive]: setting.value === option.value
                        })}
                        onClick={() => handleSave({ id: setting._id, value: option.value })}
                    >
                        {t(option.label)}
                    </div>
                ))
            ) : setting.type === SettingType.SelectorInfinite ? (
                <InputBox name={setting.placeholder || ''} icon={<SelectorInfiniteIcon />}>
                    <div>{setting.value}</div>
                </InputBox>
            ) : null}
        </InputBoxWrapper>
    );
});
