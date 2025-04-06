"use client";
import styles from "./InputBox.module.css";
import { DetailedHTMLProps, HTMLAttributes, JSX, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";

interface InputBoxProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    name: string;
    description?: string;
    icon?: JSX.Element;
};

export const InputBox = ({ name, children, icon, style, className, description }: InputBoxProps) => {
    const { t } = useTranslation();
    return (
        <div className={cn(styles.item, className)} style={style}>
            <div className={styles.nameContainer}>
                <div>{t(name)}</div>
                {description && <div className={styles.description}>{t(description)}</div>}
            </div>
            <div className={styles.end}>
                {children}
                {icon && <div className={styles.icon}>{icon}</div>}
            </div>
        </div>
    );
};