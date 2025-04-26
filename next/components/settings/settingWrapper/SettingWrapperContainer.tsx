"use client";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import styles from "./SettingWrapper.module.css";
import cn from "classnames";
import { SettingWrapperProps } from "./SettingWrapper";

export interface SettingWrapperContainerProps extends Pick<
    SettingWrapperProps, 'className' | 'withWrapper' | 'validateError' | 'headerChildren'
> {
    i18nLabel?: string;
    i18nDescription?: string;
    children: ReactNode;
}

export const SettingWrapperContainer = ({
    i18nLabel, i18nDescription,
    validateError,
    children, headerChildren,
    withWrapper = true, className
}: SettingWrapperContainerProps) => {
    const { t } = useTranslation();

    return (
        <div className={className}>
            <div className={styles.headerContainer}>
                {i18nLabel && <h3>{t(i18nLabel)}</h3>}
                {headerChildren && <div className={styles.headerChildren}>| {headerChildren}</div>}
            </div>
            {children}
            {
                i18nDescription &&
                t(i18nDescription) !== i18nDescription &&
                <p className={cn(styles.description, {
                    [styles.descriptionWithoutWrapper]: !withWrapper
                })}>
                    {t(i18nDescription)}
                </p>
            }
            {validateError !== '' && <div className={styles.error}>{validateError}</div>}
        </div>
    );
};