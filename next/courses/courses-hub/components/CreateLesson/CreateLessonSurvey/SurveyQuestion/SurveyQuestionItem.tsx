import { useTranslation } from "react-i18next";
import styles from "./SurveyQuestion.module.css";
import cn from "classnames";
import { ReactNode } from "react";
import { useAddQuestionToUrl } from "@/courses/courses-hub/hooks/useAddQuestionToUrl";
import { ItemSize } from "@/types/ItemSize";

type SurveyQuestionItemProps = {
    _id: string;
    text?: string;
    number: number;
    size?: ItemSize;
    children?: ReactNode;
    handleDelete?: () => void;
    deleteClassNames?: string;
};

export const SurveyQuestionItem = ({
    _id, number, text,
    size = ItemSize.Little,
    handleDelete, deleteClassNames,
    children
}: SurveyQuestionItemProps) => {
    const handleScrollToQuestion = useAddQuestionToUrl();

    const isLittle = size === ItemSize.Little;
    
    const { t } = useTranslation();

    return (
        <div
            id={!isLittle ? _id : ''}
            onClick={isLittle ? () => handleScrollToQuestion(_id) : undefined}
            className={cn(styles.container, styles[size])}
        >
            <div className={styles.body}>
                <div className={styles.title}>
                    <div className={styles.number}>{isLittle ? number : '?'}</div>
                    <div className={styles.text}>{isLittle ? text : `${t('questions.index')} ${number}`}</div>
                </div>
                {handleDelete && (
                    <div
                        className={cn(deleteClassNames, styles.action)}
                        onClick={handleDelete}
                    >
                        {t('questions.delete')}
                    </div>
                )}
            </div>
            {children}
        </div>
    );
};