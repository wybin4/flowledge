import React from "react";
import styles from "./ProgressBar.module.css";
import cn from "classnames";
import { ItemSize } from "@/types/ItemSize";
import { Gender } from "@/types/Gender";
import { handleGenderTranslation } from "@/helpers/handleGenderTranslation";
import { useTranslation } from "react-i18next";
import { useUserSetting } from "@/user/hooks/useUserSetting";
import { Language } from "@/user/types/Language";

interface ProgressBarProps {
    progress: number;
    withWrapper?: boolean;
    size?: ItemSize;
    className?: string;
    additionalText?: string;
    gender?: Gender;
    prefix?: string;
}

const ProgressBar = ({
    progress, additionalText,
    gender = Gender.Neural, prefix,
    withWrapper = false, size = ItemSize.Little,
    className
}: ProgressBarProps) => {
    const { t } = useTranslation();
    const locale = useUserSetting<Language>('language') || Language.EN;

    return (
        <>
            {progress < 99 && (
                <div className={cn(styles.container, styles[size], className, {
                    [styles.wrapper]: withWrapper
                })}>
                    <div>{Math.round(progress * 100) / 100}%</div>
                    <div className={styles.progressBarContainer}>
                        <div
                            className={styles.progressBarFill}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    {additionalText && <div>{additionalText}</div>}
                </div>
            )}
            {progress >= 99 && (
                <>{prefix && <div className={styles.description}>{handleGenderTranslation(prefix, t, gender, 'passed', locale)}</div>}</>
            )}
        </>
    );
};

export default ProgressBar;