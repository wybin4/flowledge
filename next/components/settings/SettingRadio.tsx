import { memo, useState } from "react";
import { SettingWrapperProps } from "./settingWrapper/SettingWrapper";
import { InputBox } from "@/components/inputBox/InputBox";
import { InputBoxWrapper } from "@/components/inputBox/InputBoxWrapper";
import { ToggleSwitch } from "@/components/toggleSwitch/ToggleSwitch";
import { useTranslation } from "react-i18next";

export const SettingRadio = memo(({ setting, handleSave }: SettingWrapperProps) => {
    const { t } = useTranslation();
    const [isChecked, setIsChecked] = useState<boolean>(setting.value as boolean);

    const handleToggle = () => {
        const newValue = !isChecked;
        setIsChecked(newValue);
        handleSave({ id: setting._id, value: newValue });
    };

    return (
        <InputBoxWrapper>
            <InputBox name={t(setting.i18nLabel)} style={{ cursor: 'default' }}>
                <ToggleSwitch isChecked={isChecked} onToggle={handleToggle} />
            </InputBox>
        </InputBoxWrapper>
    );
});