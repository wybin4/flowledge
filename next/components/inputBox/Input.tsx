import { JSX, ReactNode, useMemo, useState } from "react";
import styles from "./InputBox.module.css";
import cn from "classnames";

type InputProps = {
    type: InputType;
    value: string | number;
    placeholder?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClick?: () => void;
    icon?: JSX.Element;
    onClickIcon?: () => void;
    iconClassName?: string;
    readOnly?: boolean;
    disabled?: boolean;
    extraContent?: (focused?: boolean) => ReactNode | null;
    className?: string;
    inputClassName?: string;
};

export type InputType = 'number' | 'text' | 'password';

export const Input = ({
    type, value, placeholder, className, onChange, onClick,
    icon, onClickIcon, iconClassName, inputClassName,
    readOnly, disabled, extraContent
}: InputProps) => {
    const [focused, setFocused] = useState<boolean>(false);
  
    return useMemo(() => (
        <div className={cn(styles.inputContainer, className, {
            [styles.inputDisabled]: disabled || readOnly
        })}>
            {icon &&
                <span className={cn(styles.inputIcon, iconClassName, {
                    [styles.inputIconFocused]: focused,
                })} onClick={(e) => { e.stopPropagation(); onClickIcon && onClickIcon(); }}>
                    {icon}
                </span>
            }
            <input
                type={value ? type : 'text'}
                className={cn(styles.input, inputClassName)}
                value={value}
                onFocus={() => !readOnly && setFocused(true)}
                onBlur={() => {
                    setFocused(false);
                    if (!value) {
                        onChange?.({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
                    }
                }}
                onChange={onChange}
                onClick={onClick}
                placeholder={placeholder}
                readOnly={readOnly}
                disabled={disabled}
                autoComplete="off"
            />
            {extraContent?.(focused)}
        </div>
    ), [type, value, focused, extraContent]);
};