import { memo, useState, useEffect } from "react";
import { SettingWrapperProps } from "../settingWrapper/SettingWrapper";
import { SettingType, SettingValueType } from "@/types/Setting";
import styles from "./SettingInput.module.css";
import { IconKey, useIcon } from "@/hooks/useIcon";
import cn from "classnames";
import { usePasswordInput } from "@/hooks/usePasswordInput";
import { Input, InputType } from "@/components/inputBox/Input";

export const SettingInput = memo(({ setting, handleSave }: SettingWrapperProps) => {
    const [inputValue, setInputValue] = useState<SettingValueType>(setting.value);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
    const passwordInputProps = usePasswordInput();
    const isPassword = setting.type === SettingType.InputPassword;

    const type = isPassword
        ? passwordInputProps.type
        : setting.type === SettingType.InputNumber
            ? 'number'
            : 'text';

    const icon = isPassword
        ? passwordInputProps.icon
        : useIcon(type as IconKey);

    const onClickIcon = isPassword ? passwordInputProps.togglePassword : undefined;

    useEffect(() => {
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [timeoutId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value: number | string = e.target.value;

        if (setting.type === SettingType.InputNumber) {
            value = +value;
        }

        setInputValue(value);

        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        const newTimeoutId = setTimeout(() => {
            handleSave({ id: setting._id, value });
        }, 1000);

        setTimeoutId(newTimeoutId);
    };

    return (
        <Input
            type={type as InputType}
            value={inputValue as number | string}
            onChange={handleChange}
            icon={icon}
            onClickIcon={onClickIcon}
            iconClassName={cn({ [styles.inputIconPointer]: isPassword })}
        />
    );
});
