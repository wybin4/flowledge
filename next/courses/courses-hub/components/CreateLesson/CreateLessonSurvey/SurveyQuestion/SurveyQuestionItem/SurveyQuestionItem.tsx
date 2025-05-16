import { useTranslation } from "react-i18next";
import { ReactNode } from "react";
import { useAddQuestionToUrl } from "@/courses/courses-hub/hooks/useAddQuestionToUrl";
import { ItemSize } from "@/types/ItemSize";
import { Card } from "@/components/Card/Card";
import styles from "./SurveyQuestionItem.module.css";
import cn from "classnames";

type SurveyQuestionItemProps = {
    _id: string;
    title?: string;
    number?: number;
    size?: ItemSize;
    children?: ReactNode;
    handleDelete?: () => void;
    deleteClassNames?: string;
};

export const SurveyQuestionItem = ({
    _id, number, title,
    size = ItemSize.Little,
    handleDelete, deleteClassNames,
    children
}: SurveyQuestionItemProps) => {
    const handleScrollToQuestion = useAddQuestionToUrl();

    const isLittle = size === ItemSize.Little;

    const { t } = useTranslation();

    return (
        <Card
            id={!isLittle ? _id : ''}
            onClick={isLittle ? () => handleScrollToQuestion(_id) : undefined}
            title={_ => isLittle ? title : `${t('questions.index')} ${number}`}
            dotText={_ => isLittle ? String(number) : '?'}
            actions={[
                ...(handleDelete ? [{
                    title: t('questions.delete'),
                    onClick: handleDelete,
                    className: cn(deleteClassNames, styles.delete)
                }] : [])
            ]}
            clickable={isLittle ? true : false}
            size={size}
            className={styles.card}
        >{children}</Card>
    );
};