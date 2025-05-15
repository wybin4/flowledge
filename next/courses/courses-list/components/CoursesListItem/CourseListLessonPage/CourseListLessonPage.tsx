"use client";

import { PageMode } from "@/types/PageMode";
import { useEffect, useState } from "react";
import { LessonPage } from "../../../../components/LessonPage/LessonPage";
import { userApiClient } from "@/apiClient";
import { LessonGetByIdResponse } from "@/courses/courses-hub/dto/LessonGetByIdResponse";
import { coursesHubLessonsPrefixApi } from "@/helpers/prefixes";
import { useTranslation } from "react-i18next";
import { LessonPageItem } from "@/courses/courses-list/types/LessonPageItem";
import { AdditionalLessonTabs } from "@/courses/types/SynopsisLessonTabs";
import RightSidebar from "@/components/Sidebar/RightSidebar/RightSidebar";
import styles from "./CourseListLessonPage.module.css";
import { MenuButton } from "@/components/MenuButton/MenuButton";
import { ItemSize } from "@/types/ItemSize";
import cn from "classnames";
import { useNonPersistentSidebar } from "@/hooks/useNonPersistentSidebar";
import CollapsibleSection from "@/components/CollapsibleSection/CollapsibleSection";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { ChildrenPosition } from "@/types/ChildrenPosition";
import { StickyBottomBar } from "@/components/StickyBottomBar/StickyBottomBar";
import { Button, ButtonType } from "@/components/Button/Button";
import { ButtonBack } from "@/components/Button/ButtonBack/ButtonBack";
import { FillBorderUnderlineMode } from "@/types/FillBorderUnderlineMode";

export const CourseListLessonPage = ({ lessonId }: { lessonId: string }) => {
    const [lesson, setLesson] = useState<LessonPageItem | undefined>(undefined);
    const { t } = useTranslation();

    useEffect(() => {
        userApiClient.get<LessonGetByIdResponse>(
            `${coursesHubLessonsPrefixApi}.get/${lessonId}`
        ).then(lesson => setLesson(lesson));
    }, [lessonId]);

    if (!lesson) {
        return <>{t('loading')}</>;
    }

    return (
        <RightSidebar
            content={classNames =>
                <div>
                    <div style={{ height: '5.5625rem' }}></div>
                    <div style={{ overflowY: 'scroll', height: 'max-content' }}>
                        <CollapsibleSection title='основные понятия' expandedByDefault={true} {...classNames}>
                            дети
                        </CollapsibleSection>
                        <CollapsibleSection title='проектирование по' expandedByDefault={false} {...classNames}>
                            дети
                        </CollapsibleSection>
                        <CollapsibleSection title='классические методы' expandedByDefault={false} {...classNames}>
                            дети
                        </CollapsibleSection>
                    </div>
                </div>
            }
        >{(isExpanded, toggleSidebar) => (
            <div className={cn(styles.container, {
                [styles.expanded]: isExpanded
            })}>
                <StickyBottomBar barContent={
                    <div className={styles.buttonContainer}>
                        <ButtonBack hasBackButtonIcon={false} />
                        <Button
                            onClick={() => { }}
                            title={t('next')}
                            type={ButtonType.SAVE}
                            mode={FillBorderUnderlineMode.UNDERLINE}
                            noEffects={true}
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