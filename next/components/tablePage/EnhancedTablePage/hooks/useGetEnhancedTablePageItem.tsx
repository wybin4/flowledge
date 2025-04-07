import { useCallback } from "react";
import { ApiClient } from "@/types/ApiClient";
import { QueryParams } from "@/types/QueryParams";
import { useGetItem } from "@/hooks/useGetItem";

export const useGetEnhancedTablePageItem = <T,>(
    prefix: string,
    apiClient: ApiClient<T>,
    setItem: (item: T) => void,
    queryParams?: QueryParams
) => {
    const getItem = useCallback(async (_id: string) => {
        const item = await useGetItem(prefix, apiClient, _id, queryParams);
        setItem(item);
    }, [setItem]);

    return getItem;
};