import { useCallback } from "react";
import { IconKey } from "@/hooks/useIcon";
import { ApiClient } from "@/types/ApiClient";

export const useGetEnhancedTablePageItem = <T,>(
    prefix: IconKey,
    apiClient: ApiClient<T>,
    setItem: (item: T) => void
) => {
    const getItem = useCallback(async (_id: string) => {
        const item = await apiClient<T>({ url: `${prefix}/${_id}` });
        setItem(item);
    }, [setItem]);

    return getItem;
};