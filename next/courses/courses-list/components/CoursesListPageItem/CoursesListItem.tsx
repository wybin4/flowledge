"use client";

import styles from "./CoursesListItem.module.css";
import { CoursePageItem } from "@/courses/courses-list/types/CoursePageItem";
import { ReactNode, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { coursesListPrefix } from "@/helpers/prefixes";
import { CoursesListItemActions } from "./CoursesListItemActions/CoursesListItemActions";
import cn from "classnames";
import { CoursesListItemDescription } from "./CoursesListItemDescription/CoursesListItemDescription";
import { CoursesListItemMenu } from "./CoursesListItemMenu/CoursesListItemMenu";
import { CourseTabs } from "@/types/CourseTabs";
import { CourseListImage } from "./CourseListImage/CourseListImage";
import { CoursesListItemSection } from "./CoursesListItemSection/CoursesListItemSection";
import { CoursesListItemTags } from "./CoursesListItemTags/CoursesListItemTags";
import { CoursesListItemComments } from "./CoursesListItemComments/CoursesListItemComments";

type CoursesListItemProps = {
    course: CoursePageItem;
    header?: ReactNode;
    pointer?: boolean;
    isListPage: boolean;
}

export const CoursesListItem = ({ isListPage, course, header, pointer = true }: CoursesListItemProps) => {
    const [isFavorite, setIsFavorite] = useState<boolean>(course.favorite ?? false);
    const router = useRouter();
    const searchParams = useSearchParams();
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

    const actions = <CoursesListItemActions isFavorite={isFavorite} setIsFavorite={setIsFavorite} isExpanded={!isListPage} className={cn({
        [styles.actionsRight]: isListPage,
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
                <div className={styles.menuContainer}>
                    <div>
                        {selectedMenuTab !== CourseTabs.Comments &&
                            <CoursesListItemDescription
                                description={course.description}
                                className={styles.itemContainer}
                                isExpanded={selectedMenuTab === CourseTabs.About}
                                onReadMore={onReadMore}
                            />
                        }
                        {selectedMenuTab === CourseTabs.About && course.tags && course.tags.length > 0 &&
                            <CoursesListItemTags tags={course.tags} className={styles.itemContainer} />
                        }
                        {selectedMenuTab === CourseTabs.Lessons && course.sections && course.sections.length > 0 &&
                            course.sections.map(section => (
                                <CoursesListItemSection
                                    key={section._id}
                                    className={styles.itemContainer}
                                    section={section}
                                />
                            ))
                        }
                        {selectedMenuTab === CourseTabs.Comments &&
                            <CoursesListItemComments comments={course.comments ?? []} className={styles.itemContainer} />
                        }
                    </div>
                    {!isListPage &&
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