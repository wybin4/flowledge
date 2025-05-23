import styles from "./CoursesListItemTags.module.css";
import { useTranslation } from "react-i18next";
import { Tag } from "@/components/Tag/Tag";
import { ItemSize } from "@/types/ItemSize";

type CoursesListItemTagsProps = {
    className?: string;
    tags: string[];
}

export const CoursesListItemTags = ({ className, tags }: CoursesListItemTagsProps) => {
    const { t } = useTranslation();

    return (
        <div className={className}>
            <div className={styles.title}>{t('tags')}</div>
            <div className={styles.tagsContainer}>
                {tags.map((tag, item) => (
                    <Tag
                        key={item}
                        tag={tag}
                        isHovered={true}
                        size={ItemSize.Medium}
                    />
                ))}
            </div>
        </div>
    );
};
