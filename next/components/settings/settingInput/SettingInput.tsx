import { memo, useState, useEffect } from "react";
import { SettingWrapperProps } from "../settingWrapper/SettingWrapper";
import { SettingType, SettingValueType } from "@/types/Setting";
import styles from "./SettingInput.module.css";
import { IconKey, useIcon } from "@/hooks/useIcon";
import cn from "classnames";
import { usePasswordInput } from "@/hooks/usePasswordInput";

export const SettingInput = memo(({ setting, handleSave }: SettingWrapperProps) => {
    const [focused, setFocused] = useState<boolean>(false);
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
        <div className={styles.container}>
            <input
                type={type}
                className={styles.input}
                value={inputValue as string}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChange={handleChange}
            />
            <span className={cn(styles.icon, {
                [styles.iconFocused]: focused,
                [styles.iconPointer]: isPassword
            })} onClick={() => onClickIcon && onClickIcon()}>
                {icon}
            </span>
        </div>
    );
});
