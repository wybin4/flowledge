"use client";

import styles from "./CoursesListItem.module.css";
import { CoursePageItem } from "@/courses/courses-list/types/CoursePageItem";
import { ReactNode, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { coursesListPrefix } from "@/helpers/prefixes";
import { CoursesListItemActions } from "../CoursesListItemActions/CoursesListItemActions";
import cn from "classnames";
import { CoursesListItemDescription } from "../../../../components/CoursesListItemDescription/CoursesListItemDescription";
import { CoursesListItemMenu } from "../CoursesListItemMenu/CoursesListItemMenu";
import { CourseTabs } from "@/types/CourseTabs";
import { CoursesListItemTags } from "../CoursesListItemTags/CoursesListItemTags";
import { CoursesListItemComments } from "../CoursesListItemComments/CoursesListItemComments";
import { CoursesItemHeader } from "../../../../components/CoursesItemHeader/CoursesItemHeader";
import defaultStyles from "@/courses/styles/Default.module.css";
import { CourseSection } from "@/courses/components/CourseSection/CourseSection";

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
                <CoursesItemHeader
                    course={course}
                    isListPage={isListPage}
                    pointer={pointer}
                    handleClick={handleClick}
                    actions={actions}
                    header={header}
                />
                <div className={styles.menuContainer}>
                    <div>
                        {selectedMenuTab !== CourseTabs.Comments &&
                            <CoursesListItemDescription
                                description={course.description}
                                isExpanded={selectedMenuTab === CourseTabs.About}
                                onReadMore={onReadMore}
                            />
                        }
                        {selectedMenuTab === CourseTabs.About && course.tags && course.tags.length > 0 &&
                            <CoursesListItemTags tags={course.tags} className={defaultStyles.itemContainer} />
                        }
                        {selectedMenuTab === CourseTabs.Lessons && course.sections && course.sections.length > 0 &&
                            course.sections.map(section => (
                                <CourseSection
                                    key={section.section._id}
                                    className={defaultStyles.itemContainer}
                                    section={section}
                                />
                            ))
                        }
                        {selectedMenuTab === CourseTabs.Comments &&
                            <CoursesListItemComments comments={course.comments ?? []} className={defaultStyles.itemContainer} />
                        }
                    </div>
                    {!isListPage &&
                        <CoursesListItemMenu
                            className={defaultStyles.itemContainer}
                            selectedTab={selectedMenuTab}
                            setSelectedTab={onMenuTabChange}
                        />
                    }
                </div>
            </div>
        </>
    );
};