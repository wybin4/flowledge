"use client";

import { useTranslation } from "react-i18next";
import styles from "./CourseListSurveyResultModalContent.module.css";
import { useIcon } from "@/hooks/useIcon";
import { getSurveyResultPostfix } from "@/courses/courses-list/functions/getSurveyResultPostfix";

type CourseListSurveyResultProps = {
    prefix: string;
    isAttemptsExhausted: boolean;
    isPassed: boolean;
};


export const CourseListSurveyResult = ({
    prefix, isAttemptsExhausted, isPassed
}: CourseListSurveyResultProps) => {
    const { t } = useTranslation();

    const smileIcon = useIcon('smile');
    const sadIcon = useIcon('sad');

    const resultPostfix = getSurveyResultPostfix(isPassed, isAttemptsExhausted);

    return (
        <>
            <div className={styles.resultContainer}>
                <div className={styles.resultIcon}>
                    {isPassed ? smileIcon : sadIcon}
                </div>
                <div className={styles.resultText}>{t(`${prefix}${resultPostfix}`)}</div>
            </div>
        </>
    );
};