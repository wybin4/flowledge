import { useTranslation } from "react-i18next";
import { ReactNode } from "react";
import { useAddQuestionToUrl } from "@/courses/courses-hub/hooks/useAddQuestionToUrl";
import { ItemSize } from "@/types/ItemSize";
import { Card } from "@/components/Card/Card";

type SurveyQuestionItemProps = {
    _id: string;
    title?: string;
    number: number;
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
                    className: deleteClassNames
                }] : [])
            ]}
            clickable={isLittle ? true : false}
            size={size}
        >{children}</Card>
    );
};