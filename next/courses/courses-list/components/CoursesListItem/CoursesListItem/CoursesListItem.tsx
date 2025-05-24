"use client";

import styles from "./CoursesListItem.module.css";
import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { courseProgressPrefix, coursesListPrefix, coursesListPrefixApi, courseSubscriptionsPrefix } from "@/helpers/prefixes";
import { CoursesListItemActions } from "../CoursesListItemActions/CoursesListItemActions";
import cn from "classnames";
import { CoursesListItemDescription } from "../../../../components/CoursesListItemDescription/CoursesListItemDescription";
import { CoursesListItemMenu } from "../CoursesListItemMenu/CoursesListItemMenu";
import { CourseTabs } from "@/types/CourseTabs";
import { CoursesListItemTags } from "../CoursesListItemTags/CoursesListItemTags";
import { CoursesItemHeader } from "../../../../components/CoursesItemHeader/CoursesItemHeader";
import defaultStyles from "@/courses/styles/Default.module.css";
import { CourseSection } from "@/courses/components/CourseSection/CourseSection";
import { CoursesListItemComments } from "../CoursesListItemComments/CoursesListItemComments";
import { userApiClient } from "@/apiClient";
import { ToggleFavouriteRequest } from "@/courses/courses-list/types/ToggleFavourite";
import { CourseWithSubscriptionItem } from "@/courses/courses-list/types/CourseItem";
import { LessonGetResponse } from "@/courses/courses-hub/dto/LessonGetResponse";
import { getFirstValidLessonType } from "@/courses/courses-list/functions/getFirstValidLessonType";
import { LessonSaveType } from "@/courses/types/LessonSaveType";
import { useTranslation } from "react-i18next";
import { Tag, TagType } from "@/components/Tag/Tag";
import ProgressBar from "@/components/ProgressBar/ProgressBar";
import { ItemSize } from "@/types/ItemSize";

type CoursesListItemProps = {
    course: CourseWithSubscriptionItem;
    header?: ReactNode;
    pointer?: boolean;
    isListPage: boolean;
}

export const CoursesListItem = ({ isListPage, course, header, pointer = true }: CoursesListItemProps) => {
    const router = useRouter();
    const currentPath = usePathname();
    const searchParams = useSearchParams();
    const [selectedMenuTab, setSelectedMenuTab] = useState<CourseTabs>(CourseTabs.Lessons);
    const pathnamePrefix = `${coursesListPrefix}/${course._id}`;

    const { t } = useTranslation();

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

    const handleToggleFavourite = (newIsFavourite: boolean) => {
        userApiClient.post<ToggleFavouriteRequest>(
            `${coursesListPrefixApi}.toggle-favourite/${course._id}`, {
            isFavourite: newIsFavourite
        });
    }

    const actions = (
        <CoursesListItemActions
            isFavourite={course.isFavourite ?? false}
            setIsFavourite={handleToggleFavourite}
            isExpanded={!isListPage}
            className={cn({
                [styles.actionsRight]: isListPage,
            })}
        />
    );

    const onReadMore = () => {
        router.push(`?tab=${CourseTabs.About}`);
    }

    const onMenuTabChange = (tab: CourseTabs) => {
        router.push(`?tab=${tab}`);
        setSelectedMenuTab(tab);
    }

    const handleOnHasNoProgressClick = async (lesson: LessonGetResponse, type: LessonSaveType) => {
        let version = course.courseVersion;

        if (!course.progress) {
            const { versionId } = await userApiClient.post<{ versionId: string }>(
                `${courseSubscriptionsPrefix}/${courseProgressPrefix}.initiate`, {
                courseId: course._id, lessonId: lesson._id, type
            });
            version = versionId || course.courseVersion;
        }

        if (version) {
            router.push(`${currentPath}/${lesson._id}?version=${version}`);
        }
    };

    return (
        <>
            <div className={styles.container}>
                <CoursesItemHeader
                    course={course}
                    isListPage={isListPage}
                    pointer={pointer}
                    handleClick={isListPage ? handleClick : undefined}
                    actions={actions}
                    header={header}
                    underTitle={
                        <div className={styles.underTitle}>
                            {!isListPage && (
                                <>
                                    {!course.progress && (
                                        <Tag
                                            tag={t(`${coursesListPrefix}.course-not-started`)}
                                            type={TagType.Info}
                                        />
                                    )}
                                    {course.progress && (
                                        <ProgressBar
                                            progress={course.progress}
                                            withWrapper={true}
                                            size={ItemSize.Medium}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    }
                />
                <div className={styles.menuContainer}>
                    <div>
                        {!isListPage && selectedMenuTab !== CourseTabs.Comments &&
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
                            <div>
                                {course.sections.map(section => (
                                    <CourseSection
                                        key={section.section._id}
                                        className={defaultStyles.itemContainer}
                                        section={section}
                                        setLesson={lesson => {
                                            const type = getFirstValidLessonType(lesson);
                                            if (type) {
                                                handleOnHasNoProgressClick(lesson, type);
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                        }
                        {selectedMenuTab === CourseTabs.Comments && (
                            <CoursesListItemComments
                                comments={course.comments ?? []}
                                className={defaultStyles.itemContainer}
                            />
                        )}
                    </div>
                    {!isListPage && (
                        <CoursesListItemMenu
                            className={defaultStyles.itemContainer}
                            selectedTab={selectedMenuTab}
                            setSelectedTab={onMenuTabChange}
                        />
                    )}
                </div>
            </div>
        </>
    );
};