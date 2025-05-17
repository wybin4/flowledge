"use client";

import { PageMode } from "@/types/PageMode";
import { useEffect, useState } from "react";
import { LessonPage } from "../../../../components/LessonPage/LessonPage";
import { userApiClient } from "@/apiClient";
import { coursesListLessonsPrefixApi, coursesListPrefix, coursesListSectionsPrefixApi } from "@/helpers/prefixes";
import { useTranslation } from "react-i18next";
import { LessonPageItem } from "@/courses/courses-list/types/LessonPageItem";
import RightSidebar from "@/components/Sidebar/RightSidebar/RightSidebar";
import styles from "./CourseListLessonPage.module.css";
import { MenuButton } from "@/components/MenuButton/MenuButton";
import { ItemSize } from "@/types/ItemSize";
import cn from "classnames";
import CollapsibleSection from "@/components/CollapsibleSection/CollapsibleSection";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { ChildrenPosition } from "@/types/ChildrenPosition";
import { StickyBottomBar } from "@/components/StickyBottomBar/StickyBottomBar";
import { Button, ButtonType } from "@/components/Button/Button";
import { ButtonBack } from "@/components/Button/ButtonBack/ButtonBack";
import { FillBorderUnderlineMode } from "@/types/FillBorderUnderlineMode";
import CollapsibleSectionChild from "@/components/CollapsibleSection/CollapsibleSectionChild";
import { CourseListImage } from "../CourseListImage/CourseListImage";
import defaultStyles from "@/courses/styles/Default.module.css";
import { SynopsisLessonTabs } from "@/courses/types/SynopsisLessonTabs";
import { LessonPageSectionItem } from "@/courses/courses-list/types/LessonPageSectionItem";
import { CourseListLessonSidebarItem } from "./CourseListLessonSidebarItem/CourseListLessonSidebarItem";
import { CourseListLessonSidebarItemChild } from "./CourseListLessonSidebarItem/CourseListLessonSidebarItemChild";

export const CourseListLessonPage = ({ lessonId }: { lessonId: string }) => {
    const [currentLesson, setLesson] = useState<LessonPageItem | undefined>(undefined);
    const [section, setSection] = useState<LessonPageSectionItem | undefined>(undefined);
    const { t } = useTranslation();

    useEffect(() => {
        userApiClient.get<LessonPageItem>(
            `${coursesListLessonsPrefixApi}.get/${lessonId}`
        ).then(currentLesson => {
            setLesson(currentLesson);
            if (currentLesson.sectionId && !section) {
                userApiClient.get<LessonPageSectionItem>(
                    `${coursesListSectionsPrefixApi}/${currentLesson.sectionId}.lessons`
                ).then(section => {
                    setSection(section);
                });
            }
        });
    }, [lessonId]);

    if (!currentLesson || !section) {
        return <>{t('loading')}</>;
    }

    return (
        <RightSidebar
            content={({ headerClassName }) =>
                <div className={styles.sidebarContainer}>
                    <div className={styles.sectionDescription}>{t(`${coursesListPrefix}.section`)}</div>
                    <h2 className={styles.sectionTitle}>{section.title}</h2>
                    <div className={styles.lessonsContainer}>
                        {section.lessons.map((lesson, index) => (
                            <CourseListLessonSidebarItem
                                key={index}
                                title={lesson.title}
                                expandedByDefault={lesson._id === currentLesson._id}
                                headerClassName={headerClassName}
                            >
                                {!lesson.hasSynopsis && !lesson.surveyId && !lesson.videoId && (
                                    <div className={cn(styles.sectionDescription, styles.negMt)}>
                                        {t('nothing-found')}
                                    </div>
                                )}
                                {lesson.videoId && (
                                    <CourseListLessonSidebarItemChild
                                        title={lesson.title}
                                        imageUrl={lesson.imageUrl}
                                        name='video'
                                        description='watch-video'
                                    />
                                )}
                                {lesson.hasSynopsis && (
                                    <CourseListLessonSidebarItemChild
                                        title={lesson.title}
                                        imageUrl={lesson.imageUrl}
                                        name='synopsis'
                                        description='read-synopsis'
                                    />
                                )}
                                {lesson.surveyId && (
                                    <CourseListLessonSidebarItemChild
                                        title={lesson.title}
                                        imageUrl={lesson.imageUrl}
                                        name='survey'
                                        description='test-yourself'
                                    />
                                )}
                            </CourseListLessonSidebarItem>
                        ))}
                    </div>
                </div>
            }
        >{(isExpanded, toggleSidebar) => (
            <div className={cn(styles.container, {
                [styles.expanded]: isExpanded
            })}>
                <StickyBottomBar barContent={
                    <div className={styles.buttonContainer}>
                        <ButtonBack hasBackButtonIcon={false} backButtonStyles={styles.backButton} />
                        <Button
                            onClick={() => { }}
                            title={t(`${coursesListPrefix}.next-material`)}
                            type={ButtonType.SAVE}
                            mode={FillBorderUnderlineMode.UNDERLINE}
                            noEffects={true}
                            className={styles.button}
                        />
                    </div>
                }>
                    <div className={cn(styles.titleContainer, styles.mb)}>
                        <Breadcrumbs
                            pathNames={[section.courseName ?? '', currentLesson.title ?? '']}
                            position={ChildrenPosition.Left}
                            className={styles.crumbsContainer}
                        />
                        <MenuButton
                            size={ItemSize.Medium}
                            isExpanded={isExpanded}
                            onClick={toggleSidebar}
                        />
                    </div>
                    <LessonPage
                        mode={PageMode.Viewer}
                        lesson={currentLesson}
                        tabs={[SynopsisLessonTabs.Synopsis]}
                    />
                </StickyBottomBar>
            </div>
        )}</RightSidebar>
    );
};