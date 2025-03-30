"use client";

import { mapCoursesHubToTable } from "../functions/mapCoursesHubToTable";
import { createCoursesHubTableHeader } from "../functions/createCoursesHubTableHeader";
import { coursesHubPrefix } from "@/helpers/prefixes";
import { EnhancedTablePage } from "@/components/TablePage/EnhancedTablePage/EnhancedTablePage";
import { TFunction } from "i18next";
import { CoursesHubTableItem } from "@/courses/courses-hub/types/CoursesHubTableItem";
import { userApiClient } from "@/apiClient";
import { Course } from "../../types/Course";

export const CoursesHubTablePage = () => {
    const getHeaderItems = (
        t: TFunction, setSortQuery: (query: string) => void
    ) => createCoursesHubTableHeader(
        t, (name, position) => {
            const newSortQuery = position ? `${name}:${position}` : '';
            setSortQuery(newSortQuery);
        }
    );

    return (
        <EnhancedTablePage<Course, CoursesHubTableItem>
            prefix={coursesHubPrefix}
            getHeaderItems={getHeaderItems}
            transformData={mapCoursesHubToTable}
            itemKeys={['title', 'creator', 'createdAt']}
            apiClient={userApiClient}
        />
    );
};