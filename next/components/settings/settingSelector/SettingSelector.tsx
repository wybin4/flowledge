import { memo } from "react";
import { SelectorSetting, SettingType, SimpleSettingValueType } from "@/types/Setting";
import { InputBoxWrapper } from "@/components/InputBox/InputBoxWrapper";
import { FiniteSelector } from "@/components/FiniteSelector/FiniteSelector";
import { SettingWrapperProps } from "../SettingWrapper/SettingWrapper";
import { InfiniteSelector } from "@/components/InfiniteSelector/InifiniteSelector";
import { InfiniteSelectorMultiple } from "@/components/InfiniteSelector/InifiniteSelectorMultiple";

interface SettingSelectorProps extends SettingWrapperProps {
    setting: SelectorSetting<SimpleSettingValueType>;
}

export const SettingSelector = memo(({ setting, handleSave, disabled }: SettingSelectorProps) => {
    return (
        <InputBoxWrapper disabled={disabled}>
            {(() => {
                switch (setting.type) {
                    case SettingType.SelectorFinite:
                        return setting.options.map(option => (
                            <FiniteSelector
                                key={option.label}
                                value={option.value as string}
                                selectedValue={setting.value as string}
                                label={option.label}
                                onClick={() => handleSave({ id: setting._id, value: option.value })}
                            />
                        ));
                    case SettingType.SelectorInfinite:
                        <InfiniteSelector
                            options={setting.options}
                            value={String(setting.value)}
                            placeholder={setting.placeholder}
                        />
                    case SettingType.SelectorInfiniteMultiple:
                        return (
                            <InfiniteSelectorMultiple
                                options={setting.options}
                                value={String(setting.value)}
                                placeholder={setting.placeholder}
                            />
                        );
                    default:
                        return null;
                }
            })()}
        </InputBoxWrapper>
    );
}, (prevProps, nextProps) =>
    JSON.stringify(prevProps.setting) === JSON.stringify(nextProps.setting) &&
    prevProps.disabled === nextProps.disabled
);
