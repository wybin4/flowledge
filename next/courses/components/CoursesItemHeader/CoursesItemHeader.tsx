"use client";

import { CoursePageItem } from "@/courses/courses-list/types/CoursePageItem";
import { ReactNode } from "react";
import cn from "classnames";
import { CourseListImage } from "../../courses-list/components/CoursesListPageItem/CourseListImage/CourseListImage";
import styles from "./CoursesItemHeader.module.css";
import defaultStyles from "@/courses/styles/Default.module.css";

type CoursesItemHeaderProps = {
    course: CoursePageItem;
    header?: ReactNode;
    pointer?: boolean;
    isListPage?: boolean;
    handleClick?: () => void;
    actions?: ReactNode;
}

export const CoursesItemHeader = ({ isListPage = false, course, header, pointer = true, handleClick, actions }: CoursesItemHeaderProps) => {
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
                            <div className={styles.titleSubtext}>sometext</div>
                            <div className={styles.titleText}>{course.title}</div>
                            <div className={styles.titleProgress}>4%</div>
                        </div>
                    </div>
                    {isListPage && actions}
                </div>
            </div>
        </div>
    );
};