import styles from "./CoursesListItemTags.module.css";
import { useTranslation } from "react-i18next";
import cn from "classnames";

type CoursesListItemTagsProps = {
    className?: string;
    tags: string[];
}

export const CoursesListItemTags = ({ className, tags }: CoursesListItemTagsProps) => {
    const { t } = useTranslation();

    return (
        <div className={className}>
            <div className={styles.title}>{t('courses-list.tags')}</div>
            <div className={styles.tagsContainer}>
                {tags.map((tag) => (
                    <div key={tag} className={styles.tag}>
                        {tag}
                    </div>
                ))}
            </div>
        </div>
    );
};
