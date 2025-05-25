import styles from "./CourseListLessonSidebarItem.module.css";
import { useTranslation } from "react-i18next";
import CollapsibleSectionChild from "@/components/CollapsibleSection/CollapsibleSectionChild";
import { coursesListPrefix } from "@/helpers/prefixes";
import { CourseListImage } from "../../CourseListImage/CourseListImage";
import ProgressBar from "@/components/ProgressBar/ProgressBar";
import cn from "classnames";
import { Gender } from "@/types/Gender";

type CourseListLessonSidebarItemChildProps = {
    imageUrl?: string;
    title: string;
    name: string;
    description: string;
    onClick: () => void;
    progress?: number;
    gender: Gender;
}

export const CourseListLessonSidebarItemChild = ({
    title, imageUrl,
    name, description, progress, gender,
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
            descriptionClassName={cn(styles.lessonDescription, {
                [styles.lessonDescriptionWhenProgress]: progress
            })}
            children={
                <>
                    {!!progress && (
                        <ProgressBar
                            progress={progress}
                            prefix={coursesListPrefix}
                            gender={gender}
                        />
                    )}
                </>
            }
        />
    );
};