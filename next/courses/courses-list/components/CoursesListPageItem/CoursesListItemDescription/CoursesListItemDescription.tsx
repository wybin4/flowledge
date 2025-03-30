import { CoursePageItem } from "@/courses/courses-list/types/CoursePageItem";
import styles from "./CoursesListItemDescription.module.css";
import { useTranslation } from "react-i18next";
import cn from "classnames";

type CoursesListItemDescriptionProps = {
    description: CoursePageItem['description'];
    className?: string;
    isExpanded: boolean;
    onReadMore: () => void;
}

export const CoursesListItemDescription = ({ description, className, isExpanded, onReadMore }: CoursesListItemDescriptionProps) => {
    const { t } = useTranslation();

    return (
        <>
            {description && <div className={cn(styles.container, className, {
                [styles.collapsed]: !isExpanded
            })}>
                <div className={cn(styles.title, {
                    [styles.collapsedTitle]: !isExpanded
                })}>{t('description')}</div>
                <div className={styles.text} dangerouslySetInnerHTML={{ __html: description }} />
                {!isExpanded && <div className={styles.readMore} onClick={onReadMore}>{t('read-more')}</div>}
            </div>}
        </>
    );
};
