import { JSX, memo, ReactNode, useMemo, useState } from "react";
import styles from "./InputBox.module.css";
import cn from "classnames";
import { TopBottomIcon } from "@/components/TopBottomIcon/TopBottomIcon";
import { TopBottomPosition } from "@/types/Sortable";

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

export type InputType = 'number' | 'text' | 'password' | 'image';

export const Input = memo(({
    type, value, placeholder, className, onChange, onClick,
    icon, onClickIcon, iconClassName, inputClassName,
    readOnly, disabled, extraContent
}: InputProps) => {
    const [focused, setFocused] = useState<boolean>(false);

    const handleNumberChange = (icon?: TopBottomPosition) => {
        onChange?.({
            target: {
                value: Number(value) + (icon === TopBottomPosition.TOP ? 1 : -1)
            }
        } as any)
    };

    return useMemo(() => (
        <div data-type='input-container' className={cn(styles.inputContainer, className, {
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
                className={cn(styles.input, inputClassName, {
                    [styles.inputNoArrows]: type === 'number',
                    [styles.hasNoIcon]: icon === undefined
                })}
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
            {type === 'number' && (
                <div className={styles.numberControls}>
                    <TopBottomIcon mode='separate' onClick={handleNumberChange} />
                </div>
            )}
            {extraContent?.(focused)}
        </div>
    ), [type, value, focused, extraContent]);
}, (prevProps, nextProps) =>
    prevProps.value === nextProps.value &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.readOnly === nextProps.readOnly &&
    prevProps.type === nextProps.type
);