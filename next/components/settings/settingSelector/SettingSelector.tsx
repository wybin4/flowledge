import { memo } from "react";
import SelectorInfiniteIcon from "../../../assets/selector-infinite.svg";
import { SelectorSetting, SettingValueType, SettingType, SettingOption, Setting } from "@/types/Setting";
import { InputBox } from "@/components/InputBox/InputBox";
import { InputBoxWrapper } from "@/components/InputBox/InputBoxWrapper";
import { UpdatableSetting } from "@/hooks/useSettings";
import { FiniteSelector } from "@/components/FiniteSelector/FiniteSelector";

type SettingSelectorProps = {
    setting: SelectorSetting<SettingValueType>;
    handleSave: (setting: UpdatableSetting) => void;
}

export const SettingSelector = memo(({ setting, handleSave }: SettingSelectorProps) => {
    return (
        <InputBoxWrapper>
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
                <InputBox name={setting.placeholder || ''} icon={<SelectorInfiniteIcon />}>
                    <div>{setting.value}</div>
                </InputBox>
            ) : null}
        </InputBoxWrapper>
    );
});
