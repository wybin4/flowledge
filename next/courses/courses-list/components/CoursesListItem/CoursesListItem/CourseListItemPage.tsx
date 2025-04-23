"use client";

import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { ChildrenPosition } from "@/types/ChildrenPosition";
import { CoursesListItem } from "./CoursesListItem";
import { useGetItem } from "@/hooks/useGetItem";
import { coursesListPrefixApi } from "@/helpers/prefixes";
import { userApiClient } from "@/apiClient";
import { CourseItem } from "@/courses/courses-list/types/CourseItem";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const CourseListItemPage = ({ _id }: { _id: string }) => {
    const [course, setCourse] = useState<CourseItem | undefined>(undefined);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchCourse = async () => {
            const data = await useGetItem<CourseItem>(coursesListPrefixApi, userApiClient, _id);
            setCourse(data);
        };

        fetchCourse();
    }, [_id]);

    if (!course) {
        return <div>{t('loading')}</div>;
    }
    console.log(course)
    return (
        <CoursesListItem
            course={course}
            header={<Breadcrumbs position={ChildrenPosition.Left} />}
            pointer={false}
            isListPage={false}
        />
    );
};