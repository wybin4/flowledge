import { memo, useEffect, useState } from "react";
import { SettingWrapperProps } from "../SettingWrapper/SettingWrapper";
import { InputBox } from "@/components/InputBox/InputBox";
import { InputBoxWrapper } from "@/components/InputBox/InputBoxWrapper";
import { ToggleSwitch } from "@/components/ToggleSwitch/ToggleSwitch";
import { useTranslation } from "react-i18next";
import styles from './SettingRadio.module.css';

export const SettingRadio = memo(({ setting, handleSave, withWrapper = true }: SettingWrapperProps & { withWrapper?: boolean }) => {
    const { t } = useTranslation();
    const [isChecked, setIsChecked] = useState<boolean>(false);

    useEffect(() => {
        setIsChecked(setting.value as boolean);
    }, [setting.value]);

    const handleToggle = () => {
        const newValue = !isChecked;
        setIsChecked(newValue);
        handleSave({ id: setting._id, value: newValue });
    };

    if (withWrapper) {
        return (
            <InputBoxWrapper>
                <InputBox name={t(setting.i18nLabel)} style={{ cursor: 'default' }}>
                    <ToggleSwitch isChecked={isChecked} onToggle={handleToggle} />
                </InputBox>
            </InputBoxWrapper>
        );
    }

    return (
        <InputBox
            className={styles.withoutWrapper}
            endClassName={styles.end}
            nameNode={<h3>{t(setting.i18nLabel)}</h3>}
            style={{ cursor: 'default' }}
        >
            <ToggleSwitch isChecked={isChecked} onToggle={handleToggle} />
        </InputBox>
    );
}, (prevProps, nextProps) =>
    JSON.stringify(prevProps.setting.value) === JSON.stringify(nextProps.setting.value) &&
    prevProps.setting._id === nextProps.setting._id
);