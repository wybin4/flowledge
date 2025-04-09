import { memo, useState } from "react";
import { SettingWrapperProps } from "./SettingWrapper/SettingWrapper";
import { InputBox } from "@/components/InputBox/InputBox";
import { InputBoxWrapper } from "@/components/InputBox/InputBoxWrapper";
import { ToggleSwitch } from "@/components/ToggleSwitch/ToggleSwitch";
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
}, (prevProps, nextProps) => JSON.stringify(prevProps.setting) === JSON.stringify(nextProps.setting));