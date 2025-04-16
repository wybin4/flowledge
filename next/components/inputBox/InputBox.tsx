"use client";
import styles from "./InputBox.module.css";
import { DetailedHTMLProps, HTMLAttributes, JSX, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";

interface InputBoxProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    name?: string;
    nameNode?: ReactNode;
    description?: string;
    icon?: JSX.Element;
    endClassName?: string;
};

export const InputBox = ({
    name = '', icon, description,
    nameNode,
    children,
    className, endClassName, style,
}: InputBoxProps) => {
    const { t } = useTranslation();
    return (
        <div className={cn(styles.item, className)} style={style}>
            <div className={styles.nameContainer}>
                <div>{nameNode || t(name)}</div>
                {description && <div className={styles.description}>{t(description)}</div>}
            </div>
            <div className={cn(styles.end, endClassName)}>
                {children}
                {icon && <div className={styles.icon}>{icon}</div>}
            </div>
        </div>
    );
};