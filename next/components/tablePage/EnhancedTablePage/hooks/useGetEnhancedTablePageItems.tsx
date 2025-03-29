import { useCallback } from "react";
import { GetDataPage } from "@/types/GetDataPage";
import { GetTotalCountPage } from "@/types/GetTotalCountPage";
import { DataPageHook } from "@/types/DataPageHook";
import { IconKey } from "@/hooks/useIcon";
import { ApiClient, FakeApiClient } from "@/types/ApiClient";

export const useGetEnhancedTablePageItems = <T,>(
    prefix: IconKey, apiClient: ApiClient<T> | FakeApiClient<T>
): DataPageHook<T> => {
    const getDataPage = useCallback(async ({ page, pageSize, searchQuery, sortQuery }: GetDataPage) => {
        const response = await apiClient<T[]>(
            { url: `${prefix}?page=${page}&pageSize=${pageSize}&searchQuery=${searchQuery}&sortQuery=${sortQuery}` }
        );
        return response;
    }, []);

    const getTotalCount = useCallback(async ({ searchQuery }: GetTotalCountPage) => {
        const response = await apiClient<number>({ url: `${prefix}/count?searchQuery=${searchQuery}` });
        return response;
    }, []);

    return { getDataPage, getTotalCount };
};