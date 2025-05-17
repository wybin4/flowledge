import CollapsibleSection, { CollapsibleSectionProps } from "@/components/CollapsibleSection/CollapsibleSection";
import cn from "classnames";
import styles from "./CourseListLessonSidebarItem.module.css";
import defaultStyles from "@/courses/styles/Default.module.css";

type CourseListLessonSidebarItemProps = Pick<CollapsibleSectionProps, 'title' | 'expandedByDefault' | 'headerClassName' | 'children'>;

export const CourseListLessonSidebarItem = ({
    title, expandedByDefault, headerClassName, children
}: CourseListLessonSidebarItemProps) => {
    return (
        <CollapsibleSection
            title={title}
            expandedDeg={-180}
            collapsedDeg={0}
            expandedByDefault={expandedByDefault}
            headerClassName={cn(
                styles.lessonHeader,
                headerClassName
            )}
            contentClassName={styles.lessonContent}
            contentExpandedClassName={styles.lessonContentExpanded}
            containerClassName={cn(
                defaultStyles.itemContainer,
                styles.lessonContainer
            )}
        >{children}</CollapsibleSection>
    );
};