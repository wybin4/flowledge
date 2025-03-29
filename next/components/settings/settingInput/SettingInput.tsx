import { memo } from "react";
import { SettingWrapperProps } from "../SettingWrapper/SettingWrapper";
import { SettingType, SettingValueType } from "@/types/Setting";
import styles from "./SettingInput.module.css";
import { IconKey, useIcon } from "@/hooks/useIcon";
import cn from "classnames";
import { usePasswordInput } from "@/hooks/usePasswordInput";
import { Input, InputType } from "@/components/InputBox/Input";
import { useDebouncedSave } from "@/hooks/useDebouncedSave";

export const SettingInput = memo(({ setting, handleSave }: SettingWrapperProps) => {
    const isPassword = setting.type === SettingType.InputPassword;
    const passwordInputProps = usePasswordInput();

    const type = isPassword
        ? passwordInputProps.type
        : setting.type === SettingType.InputNumber
            ? "number"
            : "text";

    const icon = isPassword
        ? passwordInputProps.icon
        : useIcon(type as IconKey);

    const onClickIcon = isPassword ? passwordInputProps.togglePassword : undefined;

    const [inputValue, setInputValue] = useDebouncedSave<SettingValueType>(
        setting.value,
        1000,
        (value) => handleSave({ id: setting._id, value })
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
            iconClassName={cn({ [styles.inputIconPointer]: isPassword })}
        />
    );
});
