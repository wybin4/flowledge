"use client";

import styles from "./CoursesListItem.module.css";
import { CoursePageItem } from "@/courses/courses-list/types/CoursePageItem";
import { ReactNode, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { coursesListPrefix } from "@/helpers/prefixes";
import { ChildrenPosition } from "@/types/ChildrenPosition";
import { CoursesListItemActions } from "./CoursesListItemActions/CoursesListItemActions";
import cn from "classnames";
import { CoursesListItemDescription } from "./CoursesListItemDescription/CoursesListItemDescription";
import { CoursesListItemMenu } from "./CoursesListItemMenu/CoursesListItemMenu";
import { CourseTabs } from "@/types/CourseTabs";
import { CoursesListItemLesson } from "./CoursesListItemLesson/CoursesListItemLesson";
import { CourseListImage } from "./CourseListImage/CourseListImage";

type CoursesListItemProps = {
    course: CoursePageItem;
    actionsPosition?: ChildrenPosition.Top | ChildrenPosition.Right;
    header?: ReactNode;
    pointer?: boolean;
    hasMenu?: boolean;
    isTitleClickable?: boolean;
}

export const CoursesListItem = ({ course, header, actionsPosition = ChildrenPosition.Right, pointer = true, hasMenu = false, isTitleClickable = true }: CoursesListItemProps) => {
    const [isMarked, setIsMarked] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const isRightPosition = actionsPosition === ChildrenPosition.Right;
    const [selectedMenuTab, setSelectedMenuTab] = useState<CourseTabs>(CourseTabs.Lessons);
    const pathnamePrefix = `${coursesListPrefix}/${course._id}`;

    useEffect(() => {
        const tab = searchParams.get('tab') as CourseTabs | null;
        if (!tab) {
            router.push(`?tab=${CourseTabs.Lessons}`);
        } else {
            setSelectedMenuTab(tab);
        }
    }, [searchParams]);

    const handleClick = () => {
        router.push(pathnamePrefix);
    }

    const actions = <CoursesListItemActions isMarked={isMarked} setIsMarked={setIsMarked} isExpanded={!isRightPosition} className={cn({
        [styles.actionsRight]: isRightPosition,
    })} />;

    const onReadMore = () => {
        router.push(`?tab=${CourseTabs.About}`);
    }

    const onMenuTabChange = (tab: CourseTabs) => {
        router.push(`?tab=${tab}`);
        setSelectedMenuTab(tab);
    }

    return (
        <>
            <div className={styles.container}>
                <div className={cn(styles.itemContainer, {
                    [styles.pointer]: pointer,
                    [styles.actionsTop]: !isRightPosition,
                })}>
                    {!isRightPosition && <div className={styles.header}>
                        <div>{header}</div>
                        {actions}
                    </div>}
                    <div>
                        <div className={styles.item} onClick={isTitleClickable ? handleClick : undefined}>
                            <div className={styles.itemHeader}>
                                <CourseListImage imageUrl={course.imageUrl} title={course.title} />
                                <div className={styles.title}>
                                    <div className={styles.titleSubtext}>sometext</div>
                                    <div className={styles.titleText}>{course.title}</div>
                                    <div className={styles.titleProgress}>4%</div>
                                </div>
                            </div>
                            {isRightPosition && actions}
                        </div>
                    </div>
                </div>
                <div className={styles.menuContainer}>
                    {selectedMenuTab !== CourseTabs.Comments &&
                        <div>
                            <CoursesListItemDescription
                                description={course.description}
                                className={styles.itemContainer}
                                isExpanded={selectedMenuTab === CourseTabs.About}
                                onReadMore={onReadMore}
                            />
                            {selectedMenuTab === CourseTabs.Lessons && course.lessons && course.lessons.length > 0 &&
                                course.lessons.map(lesson => (
                                    <CoursesListItemLesson
                                        className={styles.itemContainer}
                                        key={lesson._id}
                                        lesson={lesson}
                                    />
                                ))
                            }
                        </div>
                    }
                    {hasMenu &&
                        <CoursesListItemMenu
                            className={styles.itemContainer}
                            selectedTab={selectedMenuTab}
                            setSelectedTab={onMenuTabChange}
                        />
                    }
                </div>
            </div>
        </>
    );
};