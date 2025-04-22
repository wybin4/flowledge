import { CourseItem } from "@/courses/courses-list/types/CourseItem";
import styles from "./CoursesListItemDescription.module.css";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import defaultStyles from "@/courses/styles/Default.module.css";

type CoursesListItemDescriptionProps = {
    description: CourseItem['description'];
    isExpanded: boolean;
    onReadMore?: () => void;
}

export const CoursesListItemDescription = ({ description, isExpanded, onReadMore }: CoursesListItemDescriptionProps) => {
    const { t } = useTranslation();

    return (
        <>
            {description && <div className={cn(styles.container, defaultStyles.itemContainer, {
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
