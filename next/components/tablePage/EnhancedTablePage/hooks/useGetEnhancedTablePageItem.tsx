import { useCallback } from "react";
import { ApiClient } from "@/types/ApiClient";
import { QueryParams } from "@/types/QueryParams";
import { setQueryParams } from "@/helpers/setQueryParams";

export const useGetEnhancedTablePageItem = <T,>(
    prefix: string,
    apiClient: ApiClient<T>,
    setItem: (item: T) => void,
    queryParams?: QueryParams
) => {
    const getItem = useCallback(async (_id: string) => {
        const item = await apiClient<T>(
            { url: `${prefix}.get/${_id}${queryParams ? setQueryParams(queryParams) : ""}` }
        );
        setItem(item);
    }, [setItem]);

    return getItem;
};