import { useCallback } from "react";
import { QueryParams } from "@/types/QueryParams";
import { useGetItem } from "@/hooks/useGetItem";
import { ApiClientMethods } from "@/apiClient";

export const useGetEnhancedTablePageItem = <T,>(
    prefix: string,
    apiClient: ApiClientMethods,
    setItem: (item: T) => void,
    queryParams?: QueryParams
) => {
    const getItem = useCallback(async (id: string) => {
        const item = await useGetItem<T>(prefix, apiClient, id, queryParams);
        setItem(item);
    }, [setItem]);

    return getItem;
};