import { memo } from "react";
import { SettingWrapperProps } from "../SettingWrapper/SettingWrapper";
import { SettingType, SettingValueType } from "@/types/Setting";
import styles from "./SettingInput.module.css";
import { IconKey, useIcon } from "@/hooks/useIcon";
import cn from "classnames";
import { usePasswordInput } from "@/hooks/usePasswordInput";
import { Input, InputType } from "@/components/InputBox/Input";
import { useDebouncedSave } from "@/hooks/useDebouncedSave";
import { useTranslation } from "react-i18next";

export const SettingInput = memo(({ setting, handleSave, debounceTime = 1000, disabled }: SettingWrapperProps) => {
    const isPassword = setting.type === SettingType.InputPassword;
    const passwordInputProps = usePasswordInput();

    const { t } = useTranslation();

    const type = isPassword
        ? passwordInputProps.type
        : setting.type === SettingType.InputNumber
            ? "number"
            : "text";

    const icon = isPassword
        ? passwordInputProps.icon
        : setting.type === SettingType.InputImage
            ? useIcon('image') : useIcon(type as IconKey);

    const onClickIcon = isPassword ? passwordInputProps.togglePassword : undefined;

    const [inputValue, setInputValue] = useDebouncedSave<SettingValueType>(
        setting.value,
        debounceTime,
        (value) => handleSave({ id: setting.id, value })
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value: number | string = e.target.value;
        if (setting.type === SettingType.InputNumber) {
            value = +value;
        }

        setInputValue(value);
    };

    return (
        <Input
            type={type as InputType}
            value={inputValue as number | string}
            onChange={handleChange}
            icon={icon}
            onClickIcon={onClickIcon}
            placeholder={
                setting.type === SettingType.InputImage
                    ? t('upload')
                    : setting.type === SettingType.InputPassword
                        ? t('enter-new-password')
                        : setting.placeholder
            }
            iconClassName={cn({ [styles.inputIconPointer]: isPassword })}
            disabled={disabled}
        />
    );
}, (prevProps, nextProps) =>
    JSON.stringify(prevProps.setting) === JSON.stringify(nextProps.setting) &&
    prevProps.disabled === nextProps.disabled
);
