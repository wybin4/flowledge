import { userApiClient } from "@/apiClient";
import { getDataPageWithApi } from "@/components/TablePage/EnhancedTablePage/functions/getDataPageWithApi";
import { coursesListPrefixApi } from "@/helpers/prefixes";
import { useEnhancedPagination } from "@/hooks/useEnhancedPagination";
import { CourseItem, CourseWithSubscriptionItem } from "../../types/CourseItem";
import { CoursesListItem } from "../CoursesListItem/CoursesListItem/CoursesListItem";
import { useEffect } from "react";
import { CoursesListHeader } from "../CoursesListHeader/CoursesListHeader";
import { useTranslation } from "react-i18next";

type CoursesListInfiniteProps = {
    excludedIds: string[];
    searchQuery: string;
    courses?: CourseWithSubscriptionItem[];
    setCourses: (newCourses?: CourseWithSubscriptionItem[]) => void;
};

export const CoursesListInfinite = ({
    courses, setCourses,
    excludedIds,
    searchQuery
}: CoursesListInfiniteProps) => {
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
        const filteredData = (data as CourseWithSubscriptionItem[]).filter(
            course => !excludedIds.includes(course._id)
        );
        setCourses(filteredData);
    }, [data, excludedIds]);

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