import { useTranslation } from "react-i18next";
import styles from "./SurveyQuestion.module.css";
import cn from "classnames";
import { ReactNode } from "react";

export enum SurveyQuestionItemType {
    Big = 'big',
    Little = 'little'
}

type SurveyQuestionItemProps = {
    text?: string;
    number: number;
    type?: SurveyQuestionItemType;
    children?: ReactNode;
};

export const SurveyQuestionItem = ({
    number, text, type = SurveyQuestionItemType.Little, children
}: SurveyQuestionItemProps) => {
    const isLittle = type === SurveyQuestionItemType.Little;
    const { t } = useTranslation();

    return (
        <div className={cn(styles.container, styles[type])}>
            <div className={styles.body}>
                <div className={styles.number}>{isLittle ? number : '?'}</div>
                <div className={styles.text}>{isLittle ? text : `${t('questions.index')} ${number}`}</div>
            </div>
            {children}
        </div>
    );
};