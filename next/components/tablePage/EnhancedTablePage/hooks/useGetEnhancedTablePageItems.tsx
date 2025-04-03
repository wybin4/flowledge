import { useCallback } from "react";
import { GetDataPage } from "@/types/GetDataPage";
import { GetTotalCountPage } from "@/types/GetTotalCountPage";
import { DataPageHook } from "@/types/DataPageHook";
import { IconKey } from "@/hooks/useIcon";
import { ApiClient, FakeApiClient } from "@/types/ApiClient";
import { useQuery } from '@tanstack/react-query';

export const useGetEnhancedTablePageItems = <T,>(
    prefix: IconKey, apiClient: ApiClient<T> | FakeApiClient<T>
): DataPageHook<T> => {
    const getDataPage = useCallback(async ({ page, pageSize, searchQuery, sortQuery }: GetDataPage) => {
        const response = await apiClient<T[]>({
            url: `${prefix}?page=${page}&pageSize=${pageSize}&searchQuery=${searchQuery}&sortQuery=${sortQuery}`
        });
        return Array.isArray(response) ? response : [response];
    }, [prefix, apiClient]);

    const getTotalCount = useCallback(async ({ searchQuery }: GetTotalCountPage) => {
        const response = await apiClient<number>({
            url: `${prefix}/count?searchQuery=${searchQuery}`
        });
        return typeof response === 'number' ? response : 0;
    }, [prefix, apiClient]);

    const { data: dataPage, isLoading: isDataLoading } = useQuery<T[], Error>({
        queryKey: [`${prefix}DataPage`],
        queryFn: () => getDataPage({ page: 1, pageSize: 10, searchQuery: '', sortQuery: '' })
    });

    const { data: totalCount, isLoading: isTotalCountLoading } = useQuery<number, Error>({
        queryKey: [`${prefix}TotalCount`],
        queryFn: () => getTotalCount({ searchQuery: '' })
    });

    return {
        getDataPage,
        getTotalCount,
        dataPage,
        totalCount,
        isLoading: isDataLoading || isTotalCountLoading
    };
};