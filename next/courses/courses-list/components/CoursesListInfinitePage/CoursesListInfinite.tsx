import { userApiClient } from "@/apiClient";
import { getDataPageWithApi } from "@/components/TablePage/EnhancedTablePage/functions/getDataPageWithApi";
import { coursesListPrefixApi } from "@/helpers/prefixes";
import { useEnhancedPagination } from "@/hooks/useEnhancedPagination";
import { CourseItem, CourseWithSubscriptionItem } from "../../types/CourseItem";
import { CoursesListItem } from "../CoursesListItem/CoursesListItem/CoursesListItem";
import { useEffect, useState } from "react";
import { CoursesListHeader } from "../CoursesListHeader/CoursesListHeader";
import { useTranslation } from "react-i18next";
import { CourseSubscriptionItem } from "../../types/CourseSubscriptionItem";

type CoursesListInfiniteProps = {
    subscriptions?: CourseSubscriptionItem[];
    excludedIds: string[];
    searchQuery: string;
};

export const CoursesListInfinite = ({
    subscriptions, excludedIds,
    searchQuery
}: CoursesListInfiniteProps) => {
    const [courses, setCourses] = useState<CourseWithSubscriptionItem[] | undefined>(undefined);
    const { t } = useTranslation();

    const { data } = useEnhancedPagination<CourseItem>({
        apiPrefix: coursesListPrefixApi,
        getDataPageFunctions: {
            getDataPage: (prefix, params) => getDataPageWithApi(
                prefix, userApiClient, params
            ),
        },
        searchQuery,
        queryParams: { excludedIds }
    });

    useEffect(() => {
        if (subscriptions && subscriptions.length) {
            const filteredData = (data as CourseWithSubscriptionItem[]).filter(
                course => !excludedIds.includes(course._id)
            );
            setCourses([...subscriptions, ...filteredData]);
        } else if (data.length) {
            const filteredData = (data as CourseWithSubscriptionItem[]).filter(
                course => !excludedIds.includes(course._id)
            );
            setCourses(filteredData);
        }
    }, [subscriptions, data, excludedIds]);

    if (!courses || !courses.length) {
        return null;
    }

    return (
        <>
            <CoursesListHeader title={t('all-courses')} count={courses.length} />
            {courses.map((item, index) => (
                <CoursesListItem
                    key={index}
                    course={item}
                    isListPage={true}
                />
            ))}
        </>
    );
};