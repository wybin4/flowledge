import { memo } from "react";
import SelectorInfiniteIcon from "../../../assets/selector-infinite.svg";
import { SelectorSetting, SettingType, SimpleSettingValueType } from "@/types/Setting";
import { InputBox } from "@/components/InputBox/InputBox";
import { InputBoxWrapper } from "@/components/InputBox/InputBoxWrapper";
import { FiniteSelector } from "@/components/FiniteSelector/FiniteSelector";
import { SettingWrapperProps } from "../SettingWrapper/SettingWrapper";

interface SettingSelectorProps extends SettingWrapperProps {
    setting: SelectorSetting<SimpleSettingValueType>;
}

export const SettingSelector = memo(({ setting, handleSave, disabled }: SettingSelectorProps) => {
    return (
        <InputBoxWrapper disabled={disabled}>
            {setting.type === SettingType.SelectorFinite ? (
                setting.options.map(option => (
                    <FiniteSelector
                        key={option.label}
                        value={option.value as string}
                        selectedValue={setting.value as string}
                        label={option.label}
                        onClick={() => handleSave({ id: setting._id, value: option.value })}
                    />
                ))
            ) : setting.type === SettingType.SelectorInfinite ? (
                <InputBox
                    name={setting.placeholder || ''}
                    icon={<SelectorInfiniteIcon />}
                >
                    <div>{setting.value}</div>
                </InputBox>
            ) : null}
        </InputBoxWrapper>
    );
}, (prevProps, nextProps) => JSON.stringify(prevProps.setting) === JSON.stringify(nextProps.setting));
