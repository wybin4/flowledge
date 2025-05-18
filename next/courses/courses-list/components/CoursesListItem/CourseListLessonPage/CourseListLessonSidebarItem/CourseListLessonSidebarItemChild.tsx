import styles from "./CourseListLessonSidebarItem.module.css";
import { useTranslation } from "react-i18next";
import CollapsibleSectionChild from "@/components/CollapsibleSection/CollapsibleSectionChild";
import { coursesListPrefix } from "@/helpers/prefixes";
import { CourseListImage } from "../../CourseListImage/CourseListImage";

type CourseListLessonSidebarItemChildProps = {
    imageUrl?: string;
    title: string;
    name: string;
    description: string;
    onClick: () => void;
}

export const CourseListLessonSidebarItemChild = ({
    title, imageUrl,
    name, description,
    onClick
}: CourseListLessonSidebarItemChildProps) => {
    const { t } = useTranslation();

    return (
        <CollapsibleSectionChild
            onClick={onClick}
            title={t(`${coursesListPrefix}.lessons.${name}`)}
            description={t(`${coursesListPrefix}.${description}`)}
            isViewed={false}
            image={imageUrl &&
                <CourseListImage
                    imageUrl={imageUrl}
                    title={title}
                    size='medium'
                />
            }
            childClassName={styles.lessonContentContainer}
            titleTextContainerClassName={styles.lessonTitleTextContainer}
            descriptionClassName={styles.lessonDescription}
        />
    );
};