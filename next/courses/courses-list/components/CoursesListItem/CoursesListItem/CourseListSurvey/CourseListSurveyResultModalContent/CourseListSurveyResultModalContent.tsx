"use client";

import { SurveyResult } from "@/courses/types/SurveyResult";
import { coursesListPrefix } from "@/helpers/prefixes";
import { useTranslation } from "react-i18next";
import styles from "./CourseListSurveyResultModalContent.module.css";
import { useIcon } from "@/hooks/useIcon";
import cn from "classnames";
import { CourseListSurveyResult } from "./CourseListSurveyResult";
import { getSurveyResultPostfix } from "@/courses/courses-list/functions/getSurveyResultPostfix";

type CourseListSurveyResultModalContentProps = {
    result: SurveyResult;
    isInitial?: boolean;
    onRetry?: () => void;
    onExit: () => void;
    onStart?: () => void;
    onNext: () => void;
    titleNext: string;
};

export const CourseListSurveyResultModalContent = ({
    result, isInitial, titleNext,
    onRetry, onExit, onStart, onNext
}: CourseListSurveyResultModalContentProps) => {
    const { t } = useTranslation();
    const prefix = `${coursesListPrefix}.survey.`;
    const isPassed = result.currentResult > result.passThreshold;
    const isAttemptsExhausted = result.maxAttempts <= result.userAttempts;

    const helloIcon = useIcon('hello');

    return (
        <>
            <div className={styles.container}>
                {!onStart && (
                    <CourseListSurveyResult
                        prefix={prefix}
                        isAttemptsExhausted={isAttemptsExhausted}
                        isPassed={isPassed}
                    />
                )}
                {onStart && (
                    <div className={styles.resultContainer}>
                        <div className={styles.resultIcon}>{helloIcon}</div>
                        <div className={styles.resultText}>{t(`${coursesListPrefix}.lessons.survey`)}</div>
                        <div className={styles.resultDescription}>
                            {t(`${prefix}${getSurveyResultPostfix(isPassed, isAttemptsExhausted)}`)}
                        </div>
                    </div>
                )}
                <div className={styles.colsContainer}>
                    <div className={styles.col}>
                        <div className={styles.colText}>{t(`${prefix}${isInitial ? 'best' : 'current'}-result`)}</div>
                        <div>{isInitial ? result.bestResult : result.currentResult}%</div>
                    </div>
                    <div className={styles.col}>
                        <div className={styles.colText}>{t(`${prefix}pass-threshold`)}</div>
                        <div>{result.passThreshold}%</div>
                    </div>
                    <div className={styles.col}>
                        <div className={styles.colText}>{t(`${prefix}attempts`)}</div>
                        <div>{result.userAttempts}/{result.maxAttempts}</div>
                    </div>
                </div>
                <div className={styles.buttonsContainer}>
                    {!isInitial && <div className={styles.button}>{t(`${prefix}details`)}</div>}
                    {!isInitial && !isAttemptsExhausted && (
                        <div className={styles.button} onClick={onRetry}>
                            {t(`${prefix}retry`)}
                        </div>
                    )}
                    {onStart && !isAttemptsExhausted && (
                        <div className={cn(styles.button, styles.light)} onClick={onStart}>
                            {t(`${prefix}start`)}
                        </div>
                    )}
                    <div
                        className={cn(styles.button, {
                            [styles.light]: !onStart
                        })}
                        onClick={onNext}
                    >
                        {t(`${coursesListPrefix}.${titleNext}`)}
                    </div>
                    {<div className={cn(styles.button, {
                        [styles.light]: !onStart
                    })} onClick={onExit}>
                        {t(`${prefix}exit`)}
                    </div>}
                </div>
            </div>
        </>
    );
};