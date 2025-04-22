"use client";

import { CourseItem } from "../../types/CourseItem";
import { useState } from "react";
import { coursesListPrefixApi } from "@/helpers/prefixes";
import { userApiClient } from "@/apiClient";
import { getDataPageWithApi } from "@/components/TablePage/EnhancedTablePage/functions/getDataPageWithApi";
import { useEnhancedPagination } from "@/hooks/useEnhancedPagination";
import { CoursesListItem } from "../CoursesListItem/CoursesListItem/CoursesListItem";

export const CoursesListInfinitePage = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');

    const { data } = useEnhancedPagination<CourseItem>({
        apiPrefix: coursesListPrefixApi,
        getDataPageFunctions: {
            getDataPage: (prefix, params) => getDataPageWithApi(prefix, userApiClient, params),
        },
        searchQuery
    });

    return (
        <>
            {data.map((item, index) => (
                <CoursesListItem
                    key={index}
                    course={item}
                    isListPage={true}
                />
            ))}
        </>
    );
};