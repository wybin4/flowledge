import { useTranslation } from "react-i18next";
import styles from "./FiniteSelector.module.css";
import cn from "classnames";
import { ReactNode } from "react";
import { FillBorderUnderlineMode } from "@/types/FillBorderUnderlineMode";
import { ChildrenPosition } from "@/types/ChildrenPosition";

type FiniteSelectorProps = {
    value: string;
    selectedValue: string;
    label: string;
    onClick: () => void;
    className?: string;
    activeClassName?: string;
    mode?: FillBorderUnderlineMode;
    icon?: ReactNode;
    iconPosition?: ChildrenPosition;
    disabled?: boolean;
};

export const FiniteSelector = ({
    value, selectedValue,
    label, onClick, disabled,
    icon, iconPosition = ChildrenPosition.TopRight,
    className, activeClassName, mode = FillBorderUnderlineMode.FILL,
}: FiniteSelectorProps) => {
    const { t } = useTranslation();
    const isActive = value === selectedValue;

    const iconNode = <div className={cn(styles.icon, styles[iconPosition])}>{icon}</div>;

    return (
        <div className={cn(styles.container, {
            [styles.containerActive]: isActive,
            [styles.hovered]: !disabled
        })}>
            {iconPosition === ChildrenPosition.TopRight && icon && iconNode}
            <div
                className={cn(styles.item, isActive ? activeClassName || styles.active : undefined, className, styles[mode], {
                    [activeClassName || styles[`active${mode[0].toUpperCase() + mode.slice(1)}`]]: isActive
                })}
                onClick={!disabled ? () => onClick() : undefined}
            >
                {iconPosition === ChildrenPosition.Left && icon && iconNode}
                <div>{t(label)}</div>
            </div>
        </div>
    );
};