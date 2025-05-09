import { memo, useState } from "react";
import { SelectorSetting, SettingType, SimpleSettingValueType } from "@/types/Setting";
import { InputBoxWrapper } from "@/components/InputBox/InputBoxWrapper";
import { FiniteSelector } from "@/components/FiniteSelector/FiniteSelector";
import { SettingWrapperProps } from "../SettingWrapper/SettingWrapper";
import { InfiniteSelector } from "@/components/InfiniteSelector/InifiniteSelector";
import { InfiniteSelectorMultiple } from "@/components/InfiniteSelector/InifiniteSelectorMultiple";
import { useTranslation } from "react-i18next";

interface SettingSelectorProps extends SettingWrapperProps {
    setting: SelectorSetting<SimpleSettingValueType & string[]>;
}

export const SettingSelector = memo(({
    setting, handleSave, isOptionsTranslatable, disabled
}: SettingSelectorProps) => {
    const { t } = useTranslation();
    const [selectedValues, setSelectedValues] = useState<any[]>([]);

    return (
        <>
            {(() => {
                switch (setting.type) {
                    case SettingType.SelectorFinite:
                        return (
                            <InputBoxWrapper disabled={disabled}>{
                                setting.options.map(option => (
                                    <FiniteSelector
                                        key={option.label}
                                        value={option.value as string}
                                        selectedValue={setting.value as string}
                                        label={option.label}
                                        onClick={() => handleSave({ id: setting._id, value: option.value })}
                                    />
                                ))}
                            </InputBoxWrapper>
                        );
                    case SettingType.SelectorInfinite: {
                        return (
                            <InfiniteSelector
                                options={
                                    isOptionsTranslatable
                                        ? setting.options.map((o: any) => ({ ...o, label: t(o.label) }))
                                        : setting.options
                                }
                                width='100%'
                                value={String(setting.value)}
                                placeholder={setting.placeholder}
                                onChange={(newValue: any) => handleSave({ id: setting._id, value: newValue.value })}
                            />
                        )
                    }
                    case SettingType.SelectorInfiniteMultiple:
                        return (
                            <InfiniteSelectorMultiple
                                prefix={setting.prefix ?? ''}
                                selectedKey={setting.selectedKey ?? ''}
                                options={setting.options}
                                value={setting.value as any}
                                placeholder={setting.placeholder}
                                selectedValues={selectedValues}
                                setSelectedValues={setSelectedValues}
                                onChange={(newValue: any) => {
                                    if (newValue.action === 'remove') {
                                        return handleSave({ id: setting._id, value: setting.value.filter(s => s != newValue.value) as any });
                                    }
                                    return handleSave({ id: setting._id, value: [...setting.value || [], newValue.value] as any });
                                }}
                            />
                        );
                    default:
                        return null;
                }
            })()}
        </>
    );
}, (prevProps, nextProps) =>
    JSON.stringify(prevProps.setting) === JSON.stringify(nextProps.setting) &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.isOptionsTranslatable === nextProps.isOptionsTranslatable,
);
