import { JSX, ReactNode, useState } from "react";
import styles from "./InputBox.module.css";
import cn from "classnames";

type InputProps = {
    type: InputType;
    value: string | number;
    placeholder?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    icon?: JSX.Element;
    onClickIcon?: () => void;
    iconClassName?: string;
    readOnly?: boolean;
    disabled?: boolean;
    extraContent?: (focused?: boolean) => ReactNode;
    className?: string;
    inputClassName?: string;
};

export type InputType = 'number' | 'text' | 'password';

export const Input = ({
    type, value, placeholder, className, onChange,
    icon, onClickIcon, iconClassName, inputClassName,
    readOnly, disabled, extraContent
}: InputProps) => {
    const [focused, setFocused] = useState<boolean>(false);

    return (
        <div className={cn(styles.inputContainer, className, {
            [styles.inputDisabled]: disabled
        })}>
            {icon &&
                <span className={cn(styles.inputIcon, iconClassName, {
                    [styles.inputIconFocused]: focused,
                })} onClick={() => onClickIcon && onClickIcon()}>
                    {icon}
                </span>
            }
            <input
                type={type}
                className={cn(styles.input, inputClassName)}
                value={value}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChange={onChange}
                placeholder={placeholder}
                readOnly={readOnly}
                disabled={disabled}
            />
            {extraContent?.(focused)}
        </div>
    );
};