import { LessonItem } from "@/courses/courses-list/types/LessonItem";
import styles from "./CoursesListItemLesson.module.css";
import cn from "classnames";
import { CourseListImage } from "../CourseListImage/CourseListImage";

type CoursesListItemLessonProps = {
    className?: string;
    lesson: LessonItem;
}

export const CoursesListItemLesson = ({ className, lesson }: CoursesListItemLessonProps) => {
    return (
        <div className={cn(styles.container, className)}>
            <div className={styles.titleContainer}>
                <CourseListImage imageUrl={lesson.imageUrl} title={lesson.title} />
                <div className={styles.title}>{lesson.title}</div>
            </div>
            <div className={styles.time}>{lesson.time}</div>
        </div>
    );
};
