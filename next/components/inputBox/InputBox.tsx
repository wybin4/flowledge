"use client";
import styles from "./InputBox.module.css";
import { DetailedHTMLProps, HTMLAttributes, JSX, ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface InputBoxProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    name: string;
    icon?: JSX.Element;
};

export const InputBox = ({ name, children, icon, style }: InputBoxProps) => {
    const { t } = useTranslation();
    return (
        <div className={styles.item} style={style}>
            <div>{t(name)}</div>
            <div className={styles.end}>
                {children}
                {icon && <div className={styles.icon}>{icon}</div>}
            </div>
        </div>
    );
};