"use client";

import { CourseItem } from "@/courses/courses-list/types/CourseItem";
import { ReactNode } from "react";
import cn from "classnames";
import { CourseListImage } from "../../courses-list/components/CoursesListItem/CourseListImage/CourseListImage";
import styles from "./CoursesItemHeader.module.css";
import defaultStyles from "@/courses/styles/Default.module.css";

type CoursesItemHeaderProps = {
    course: CourseItem;
    header?: ReactNode;
    pointer?: boolean;
    isListPage?: boolean;
    handleClick?: () => void;
    actions?: ReactNode;
    underTitle?: ReactNode;
}

export const CoursesItemHeader = ({
    course, header, underTitle,
    handleClick, actions,
    isListPage = false,
    pointer = true,
}: CoursesItemHeaderProps) => {
    return (
        <div className={cn(defaultStyles.itemContainer, {
            [styles.pointer]: pointer,
            [styles.actionsTop]: !isListPage,
        })}>
            {!isListPage && <div className={styles.header}>
                <div>{header}</div>
                {actions}
            </div>}
            <div>
                <div className={styles.item} onClick={handleClick}>
                    <div className={styles.itemHeader}>
                        <CourseListImage
                            imageUrl={course.imageUrl}
                            title={course.title}
                            size={isListPage ? 'large' : 'xlarge'}
                        />
                        <div className={styles.title}>
                            <div className={styles.titleSubtext}>{course.tags?.join(', ')}</div>
                            <div className={styles.titleText}>{course.title}</div>
                            {underTitle}
                        </div>
                    </div>
                    {isListPage && actions}
                </div>
            </div>
        </div>
    );
};