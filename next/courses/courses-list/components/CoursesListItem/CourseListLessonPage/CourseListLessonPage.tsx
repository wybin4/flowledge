"use client";

import { PageMode } from "@/types/PageMode";
import { useEffect, useState } from "react";
import { LessonPage } from "../../../../components/LessonPage/LessonPage";
import { userApiClient } from "@/apiClient";
import { coursesListLessonsPrefixApi, coursesListPrefix, coursesListPrefixApi } from "@/helpers/prefixes";
import { useTranslation } from "react-i18next";
import { LessonPageItem } from "@/courses/courses-list/types/LessonPageItem";
import { AdditionalLessonTabs } from "@/courses/types/SynopsisLessonTabs";
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
import { useIcon } from "@/hooks/useIcon";
import defaultStyles from "@/courses/styles/Default.module.css";

export const CourseListLessonPage = ({ lessonId }: { lessonId: string }) => {
    const [lesson, setLesson] = useState<LessonPageItem | undefined>(undefined);
    const { t } = useTranslation();

    const surveyIcon = useIcon('survey');

    useEffect(() => {
        userApiClient.get<LessonPageItem>(
            `${coursesListLessonsPrefixApi}.get/${lessonId}`
        ).then(lesson => setLesson(lesson));
    }, [lessonId]);

    if (!lesson) {
        return <>{t('loading')}</>;
    }

    return (
        <RightSidebar
            content={({ headerClassName }) =>
                <div>
                    <div style={{ height: '5.5625rem' }}></div>
                    <div>
                        <CollapsibleSection
                            title='основные понятия'
                            expandedDeg={-180}
                            collapsedDeg={0}
                            expandedByDefault={true}
                            headerClassName={cn(
                                styles.sectionHeader,
                                headerClassName
                            )}
                            contentClassName={styles.sectionContent}
                            contentExpandedClassName={styles.sectionContentExpanded}
                            containerClassName={cn(defaultStyles.itemContainer, styles.sectionContainer)}
                        >
                            <CollapsibleSectionChild
                                title={lesson.title}
                                description={t(`${coursesListPrefix}.lesson`)}
                                isViewed={false}
                                image={lesson.imageUrl &&
                                    <CourseListImage
                                        imageUrl={lesson.imageUrl}
                                        title={lesson.title}
                                        size='medium'
                                    />
                                }
                                childClassName={styles.sectionContentContainer}
                                titleTextContainerClassName={styles.sectionTitleTextContainer}
                                descriptionClassName={styles.sectionDescription}
                            />
                            <CollapsibleSectionChild
                                title={t(`${coursesListPrefix}.lessons.survey`)}
                                description={t(`${coursesListPrefix}.test-yourself`)}
                                isViewed={false}
                                image={lesson.imageUrl &&
                                    <CourseListImage
                                        icon={surveyIcon}
                                        title={lesson.title}
                                        size='medium'
                                    />
                                }
                                titleTextContainerClassName={styles.sectionTitleTextContainer}
                                descriptionClassName={styles.sectionDescription}
                            />
                        </CollapsibleSection>
                        {/* <CollapsibleSection title='проектирование по' expandedByDefault={false} >
                            дети
                        </CollapsibleSection>
                        <CollapsibleSection title='классические методы' expandedByDefault={false} >
                            дети
                        </CollapsibleSection> */}
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
                            pathNames={[lesson.courseName ?? '', lesson.title ?? '']}
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
                        lesson={lesson}
                        additionalTabs={[AdditionalLessonTabs.Comments]}
                    />
                </StickyBottomBar>
            </div>
        )}</RightSidebar>
    );
};