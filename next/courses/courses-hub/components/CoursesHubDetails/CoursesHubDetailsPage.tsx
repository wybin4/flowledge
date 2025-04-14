"use client";

import { TablePageMode } from "@/types/TablePageMode";
import { CreateLessonDraft } from "../CreateLessonDraft/CreateLessonDraft";
import { CoursesHubDetails } from "./CoursesHubDetails";
import { useEffect, useCallback, useState, memo } from "react";
import { CoursesHubDetail } from "../../types/CoursesHubDetails";
import { useGetEnhancedTablePageItem } from "@/components/TablePage/EnhancedTablePage/hooks/useGetEnhancedTablePageItem";
import { userApiClient } from "@/apiClient";
import { coursesHubPrefix } from "@/helpers/prefixes";
import { useTranslation } from "react-i18next";
import { IconKey } from "@/hooks/useIcon";

type CoursesHubDetailsPageProps = {
    courseId: string;
    sectionId?: string;
};

export const CoursesHubDetailsPage = memo(({ courseId, sectionId }: CoursesHubDetailsPageProps) => {
    const [course, setCourse] = useState<CoursesHubDetail | undefined>(undefined);
    const { t } = useTranslation();

    const getItem = useCallback(useGetEnhancedTablePageItem<CoursesHubDetail>(
        `${coursesHubPrefix}/courses` as IconKey, userApiClient, (item) => {
            setCourse(item);
        },
        { isSmall: sectionId ?? false }
    ), [sectionId]);

    useEffect(() => {
        getItem(courseId);
    }, [courseId]);

    if (sectionId) {
        return <CreateLessonDraft mode={TablePageMode.CREATE} sectionId={sectionId} />;
    }

    if (!course) {
        return <div>{t('loading')}</div>;
    }

    return <CoursesHubDetails course={course} />;
}, (prevProps, nextProps) => {
    return prevProps.courseId === nextProps.courseId && prevProps.sectionId === nextProps.sectionId;
});

