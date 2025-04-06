import { useTranslation } from "react-i18next";
import styles from "./FiniteSelector.module.css";
import cn from "classnames";
import { ReactNode } from "react";
import { FillBorderUnderlineMode } from "@/types/FillBorderUnderlineMode";

type FiniteSelectorProps = {
    value: string;
    selectedValue: string;
    label: string;
    onClick: () => void;
    className?: string;
    mode?: FillBorderUnderlineMode;
    icon?: ReactNode;
};

export const FiniteSelector = ({ value, selectedValue, label, onClick, className, mode = FillBorderUnderlineMode.FILL, icon }: FiniteSelectorProps) => {
    const { t } = useTranslation();
    const isActive = value === selectedValue;

    return (
        <div className={cn(styles.container, {
            [styles.containerActive]: isActive
        })}>
            {icon && <div className={styles.icon}>{icon}</div>}
            <div
                className={cn(styles.item, className, styles[mode], {
                    [styles.active]: isActive,
                    [styles[`active${mode[0].toUpperCase() + mode.slice(1)}`]]: isActive
                })}
                onClick={() => onClick()}
            >
                {t(label)}
            </div>
        </div>
    );
};