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
            content={_ =>
                <div>
                </div>
            }
        >{(isExpanded, toggleSidebar) => (
            <div className={cn(styles.container, {
                [styles.expanded]: isExpanded
            })}>
                <div className={cn(styles.titleContainer, styles.mb)}>
                    <div></div>
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
            </div>
        )}</RightSidebar>
    );
};